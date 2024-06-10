export enum TextureFlag {
    Alpha = 0x2,
    UI = 0x4,
}

export class TextureInfo {
    public static readonly byteSize = 16;

    public readonly width: number;
    public readonly height: number;

    public readonly paletteOffset: number;

    // private readonly _unk: number;
    public readonly flags: number;

    public hasFlag(flag: TextureFlag) {
        return Boolean(this.flags & flag);
    }

    constructor(buffer: ArrayBufferLike, byteOffset: number) {
        const dataView = new DataView(buffer, byteOffset, TextureInfo.byteSize);

        this.width = dataView.getUint16(0, true);
        this.height = dataView.getUint16(2, true);
        this.paletteOffset = dataView.getUint32(4, true);
        // this._unk = dataView.getUint32(8);
        this.flags = dataView.getUint32(12, true);
    }
}
