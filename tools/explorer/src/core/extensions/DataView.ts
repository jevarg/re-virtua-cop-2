export { };

declare global {
    interface DataView {
        getAscii(byteOffset: number, length: number): string;
    }
}

DataView.prototype.getAscii = function (byteOffset: number, length: number) {
    const buffer = this.buffer.slice(byteOffset, byteOffset + length);
    return buffer.toAscii();
};
