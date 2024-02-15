export { };

declare global {
    interface ArrayBuffer {
        toAscii(): string;

        asciiAt(offset: number, length: number): string;
        uInt8At(offset: number): number;
        uInt32At(offset: number): number;
    }
}

ArrayBuffer.prototype.toAscii = function (): string {
    const rawStr = new Uint8Array(this);
    let str = '';
    for (const c of rawStr) {
        if (c < 32 || c > 126) {
            continue;
        }

        str += String.fromCharCode(c);
    }

    return str;
};

ArrayBuffer.prototype.asciiAt = function (offset: number, length: number) {
    return this.slice(offset, offset + length).toAscii();
};

ArrayBuffer.prototype.uInt8At = function (offset: number) {
    return new Uint8Array(this.slice(offset, offset + Uint8Array.BYTES_PER_ELEMENT))[0];
};

ArrayBuffer.prototype.uInt32At = function (offset: number) {
    return new Uint32Array(this.slice(offset, offset + Uint32Array.BYTES_PER_ELEMENT))[0];
};
