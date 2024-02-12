import { FileSystemFileHandle } from 'native-file-system-adapter';

export enum FileType {
    Exe = 'Exe',
    Texture = 'Texture',
    Palette = 'Palette',
    Model = 'Model',
}

export abstract class GameFile {
    public abstract readonly type: FileType;
    public get name(): string {
        return this._fileHandle.name;
    }

    protected readonly _fileHandle: FileSystemFileHandle;
    protected _content?: ArrayBuffer;

    constructor(file: FileSystemFileHandle) {
        this._fileHandle = file;
    }

    public async reloadContent() {
        const file = await this._fileHandle.getFile();
        this._content = await file.arrayBuffer();
    }
}
