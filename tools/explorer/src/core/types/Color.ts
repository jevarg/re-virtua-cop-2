
export class Color3 {
    public readonly r: number;
    public readonly g: number;
    public readonly b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public static fromBGR555(rgb555: number) {
        const r = ((rgb555 & 0x7c00) >> 10) / 0x1f;
        const g = ((rgb555 & 0x3e0) >> 5) / 0x1f;
        const b = (rgb555 & 0x1f) / 0x1f;

        return new Color3(b, g, r);
    }

    public toArray() {
        return [this.r, this.g, this.b];
    }
}