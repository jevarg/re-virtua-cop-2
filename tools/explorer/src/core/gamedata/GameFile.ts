import { FileSystemFileHandle } from 'native-file-system-adapter';

export enum GameFileType {
    Exe = 'Exe',
    PackedAsset = 'PackedAsset',
}

export abstract class GameFile {
    public abstract readonly fileType: GameFileType;
    protected readonly _fileHandle: FileSystemFileHandle;

    public buffer!: ArrayBuffer;
    public get name(): string {
        return this._fileHandle.name;
    }

    public static async new<T extends typeof GameFile>(...args: ConstructorParameters<T>): Promise<InstanceType<T>> {
        const instance = new (this as unknown as new (...a: ConstructorParameters<T>) => InstanceType<T>)(...args);
        await instance._init();

        return instance;
    }

    constructor(file: FileSystemFileHandle) {
        this._fileHandle = file;
    }

    protected async _init() {
        return this.read();
    }

    public async read() {
        const file = await this._fileHandle.getFile();
        this.buffer = await file.arrayBuffer();
    }
}
