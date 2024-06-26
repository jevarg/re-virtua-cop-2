import { FileSystemFileHandle } from 'native-file-system-adapter';

export enum GameFileType {
    Exe = 'Exe',
    PackedAsset = 'PackedAsset',
    Texture = 'Texture',
    Model = 'Model',
    Palette = 'Palette',
}

export abstract class GameFile {
    public abstract readonly fileType: GameFileType;
    protected readonly _fileHandle: FileSystemFileHandle;

    public buffer!: ArrayBuffer;
    public get name(): string {
        return this._fileHandle.name;
    }

    static async make<T extends new (...args: never[]) => GameFile>(this: T, ...args: ConstructorParameters<T>) {
        const instance = new this(...args);
        const start = performance.now();

        await instance._init(); // Initializing...

        console.info(`${instance.name}: ${performance.now() - start}ms`);
        return instance as InstanceType<T>;
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
