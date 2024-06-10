import { GameFileType } from '@VCRE/core/gamedata';

import { TextureInfo } from './TextureInfo';

export class Texture {
    public readonly fileType = GameFileType.Texture;
    public readonly id: number;
    public readonly offset: number;
    public readonly info: TextureInfo;

    public readonly pixels: Uint8ClampedArray;

    constructor(id: number, offset: number, info: TextureInfo, pixels: Uint8ClampedArray) {
        this.id = id;
        this.offset = offset;
        this.info = info;
        this.pixels = pixels;
    }
}
