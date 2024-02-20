import { Size } from '../../types/Size';
import { Vec2 } from '../../types/Vec2';
import { Texture } from './Texture';
import { TextureFlag } from './TextureInfo';

export type Tile = {
    position: Vec2;
    textureId: number;
};

export class TileMap {
    public static readonly pageSize = 256;
    public pageCount: number = 0;
    public tileCount: number = 0;

    private readonly _sortedTextures: Map<number, number[]>;
    private readonly _tiles = new Map<number, Tile>();

    // public static async make(...args: ConstructorParameters<typeof TileMap>) {
    //     return new this(...args);
    // }

    constructor(textures: Texture[]) {
        this._sortedTextures = this._sortTextures(textures);
        this._createTileMap(textures);
    }

    private _sortTextures(textures: Texture[]) {
        const map = new Map<number, number[]>();

        for (const texture of textures) {
            if (texture.info.hasFlag(TextureFlag.UI)) {
                continue;
            }

            if (!map.has(texture.info.width)) {
                map.set(texture.info.width, []);
            }

            map.get(texture.info.width)!.push(texture.id);
            this.tileCount++;
        }

        return map;
    }

    private _createTileMap(textures: Texture[]) {
        let remaining = this.tileCount;

        // TileMap creation reverse-engineered algorithm.
        const pack = (pageNumber: number, offset: Vec2, available: Size) => {
            if (offset.x >= available.width) {
                return;
            }

            while (offset.y < available.height && remaining > 0) {
                let currentWidth = available.width - offset.x;
                let count = 0;

                // While we still have unplaced textures
                while (count <= 0) {
                    let textureIds: number[] = [];
                    while (true) {
                        if (currentWidth <= 0) {
                            return; // Width cannot be less than 1
                        }

                        // Do we have textures with that currentWidth value?
                        const ids = this._sortedTextures.get(currentWidth);
                        if (ids) {
                            // We do! Let's place them...
                            textureIds = ids;
                            break;
                        }

                        // We have no textures with the currentWidth value.
                        // decrementing to repeat the process with a smaller width.
                        currentWidth--;
                    }

                    let y = offset.y;
                    for (const id of textureIds) {
                        // Check if texture already placed
                        if (this._tiles.has(id)) {
                            continue;
                        }

                        const texture = textures[id];
                        if (!texture) {
                            throw new Error(`Cannot get texture with id ${id}`);
                        }

                        // Do we still have enough space in height
                        // to place the texture?
                        if (texture.info.height > available.height - y) {
                            continue;
                        }

                        // We do have enough space!
                        this._tiles.set(id, {
                            textureId: id,
                            position: { x: offset.x, y }
                        });

                        // Adjusting current y position
                        y += texture.info.height;

                        // Updating counters
                        remaining--;
                        count++;
                    }

                    // Have we placed a texture?
                    if (count > 0) {
                        // Trying to keep going on the remaining width
                        pack(
                            pageNumber,
                            { x: offset.x + currentWidth, y: offset.y },
                            { width: available.width, height: y }
                        );

                        // Trying to keep going on the remaining height
                        pack(
                            pageNumber,
                            { x: offset.x, y },
                            available
                        );

                        break;
                    }

                    // No texture could be placed
                    currentWidth--;
                }

                // if (pageNumber > this.pageCount) {
                //     this.pageCount = pageNumber;
                // }

                if (!offset.x || !offset.y) {
                    return;
                }

                if (available.width != TileMap.pageSize ||
                    available.height != TileMap.pageSize) {
                    return;
                }

                if (remaining <= 0) {
                    return;
                }
            }
        };

        // Initial packing call
        pack(
            0,
            { x: 0, y: 0 },
            { width: TileMap.pageSize, height: TileMap.pageSize }
        );
    }
}