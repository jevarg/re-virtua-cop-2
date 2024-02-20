export { };

declare global {
    interface ArrayBuffer {
        toAscii(): string;

        sliceAt(offset: number, length: number): ArrayBuffer;
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

ArrayBuffer.prototype.sliceAt = function (offset: number, length: number) {
    return this.slice(offset, offset + length);
};
