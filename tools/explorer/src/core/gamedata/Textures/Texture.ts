class Texture {
    public readonly id: number;
    public readonly size: number;
    public readonly paletteOffset: number;
    public readonly flags: number;
    public readonly offset: number;
    
    constructor(id: number, size: number, paletteOffset: number, flags: number, offset: number) {
        this.id = id;
        this.size = size;
        this.paletteOffset = paletteOffset;
        this.flags = flags;
        this.offset = offset;
    }
}