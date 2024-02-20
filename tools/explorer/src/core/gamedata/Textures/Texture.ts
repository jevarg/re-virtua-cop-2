import { GameFileType } from '../GameFile';
import { TextureInfo } from './TextureInfo';

export class Texture {
    public readonly fileType = GameFileType.Texture;
    public readonly id: number;
    public readonly info: TextureInfo;

    public readonly pixels: Uint8ClampedArray;

    constructor(id: number, info: TextureInfo, pixels: Uint8ClampedArray) {
        this.id = id;
        this.info = info;
        this.pixels = pixels;
    }
}
