export class Rect {
    public readonly top: number;
    public readonly right: number;
    public readonly bottom: number;
    public readonly left: number;

    public readonly width: number;
    public readonly height: number;

    constructor(top: number, right: number, bottom: number, left: number) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;

        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
    }
}
