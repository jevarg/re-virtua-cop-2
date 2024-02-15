import { FileSystemFileHandle } from 'native-file-system-adapter';

export enum GameFileType {
    Exe = 'Exe',
    PackedAsset = 'PackedAsset',
}

export abstract class GameFile {
    public abstract readonly fileType: GameFileType;
    public get name(): string {
        return this._fileHandle.name;
    }

    protected readonly _fileHandle: FileSystemFileHandle;
    public buffer!: ArrayBuffer;

    constructor(file: FileSystemFileHandle) {
        this._fileHandle = file;
    }

    public async read() {
        const file = await this._fileHandle.getFile();
        this.buffer = await file.arrayBuffer();
    }
}
