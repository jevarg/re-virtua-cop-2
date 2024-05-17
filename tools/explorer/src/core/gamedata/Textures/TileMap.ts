import { TileNotFoundError } from '@VCRE/core/errors';
import { Rect, Size, Vec2 } from '@VCRE/core/types';

import { Texture } from './Texture';
import { TextureFlag } from './TextureInfo';

export type Tile = {
    rect: Rect;
    textureId: number;
};

export class TileMap implements Iterable<Tile> {
    public static readonly pageSize: number = 256;
    public readonly width: number = TileMap.pageSize;
    public readonly height: number;
    public readonly byteSize: number;

    public pageCount: number = 0;
    public tileCount: number = 0;

    public readonly pixels: Uint8ClampedArray;

    private readonly _sortedTextures: Map<number, number[]>;
    private readonly _tiles = new Map<number, Tile>();

    constructor(textures: Texture[]) {
        this._sortedTextures = this._sortTextures(textures);
        this._createTileMap(textures);

        this.height = this.width * this.pageCount;
        this.byteSize = this.width * this.height * 4;
        this.pixels = this._generatePixels(textures);
    }

    private _generatePixels(textures: Texture[]): Uint8ClampedArray {
        const pixels = new Uint8ClampedArray(this.byteSize);
        for (const tile of this) {
            const texture = textures[tile.textureId];
            if (!texture) {
                throw new Error(`Could not find texture with id ${tile.textureId}`);
            }

            for (let y = 0; y < texture.info.height; y++) {
                const offsetY = TileMap.pageSize * (tile.rect.top + y);

                for (let x = 0; x < texture.info.width; x++) {
                    const offsetX = tile.rect.left + x;

                    const tileMapOffset = (offsetY + offsetX) * 4;
                    const textureOffset = (y * texture.info.width + x) * 4;

                    pixels[tileMapOffset] = texture.pixels[textureOffset];
                    pixels[tileMapOffset + 1] = texture.pixels[textureOffset + 1];
                    pixels[tileMapOffset + 2] = texture.pixels[textureOffset + 2];
                    pixels[tileMapOffset + 3] = texture.pixels[textureOffset + 3];
                }
            }
        }

        return pixels;
    }

    [Symbol.iterator]() {
        return this._tiles.values();
    }

    public getTile(textureId: number): Tile {
        const tile = this._tiles.get(textureId);
        if (!tile) {
            throw new TileNotFoundError(textureId);
        }

        return tile;
    }

    private _sortTextures(textures: Texture[]) {
        const map = new Map<number, number[]>();

        for (const texture of textures) {
            // UI Textures are not included in the TileMap
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
                        if (texture.info.height > (available.height - y)) {
                            continue;
                        }

                        const rectTop = pageNumber * TileMap.pageSize + y;

                        // We do have enough space!
                        this._tiles.set(id, {
                            textureId: id,
                            rect: new Rect(
                                rectTop,
                                offset.x + texture.info.width,
                                rectTop + texture.info.height,
                                offset.x
                            ),
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
                    } else {
                        // No texture could be placed
                        currentWidth--;
                    }
                }

                if (pageNumber > this.pageCount) {
                    this.pageCount = pageNumber;
                }

                if (offset.x || offset.y) {
                    return;
                }

                if (available.width != TileMap.pageSize ||
                    available.height != TileMap.pageSize) {
                    return;
                }

                if (remaining <= 0) {
                    return;
                }

                pageNumber++;
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