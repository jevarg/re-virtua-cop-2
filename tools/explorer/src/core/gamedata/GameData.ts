import { FileSystemDirectoryHandle, showDirectoryPicker } from 'native-file-system-adapter';

import { AssetType } from './AssetPack';
import { ExeFile } from './ExeFile';
import { TreeNode, TreeNodeType } from './FSTree';
import { AssetsMap, MegaBuilder } from './MegaBuilder';

enum KnownDiskEntries {
    ExeFile = 'PPJ2DD.EXE',
    BinDir = 'BIN'
}

export class GameData {
    private static _instance?: GameData;

    public static get isInitialized() {
        return Boolean(GameData._instance);
    }

    public static get(): GameData {
        if (!GameData._instance) {
            throw new Error('GameData has not been initialized! (did you call GameData.init() ?)');
        }

        return GameData._instance;
    }

    public static async init() {
        if (this._instance) {
            console.warn('Ignored: GameData has already been initialized!');
            return;
        }

        const rootDir = await showDirectoryPicker();
        GameData._instance = new GameData(rootDir);
    }

    private readonly _rootDir: FileSystemDirectoryHandle;

    private _builder?: MegaBuilder;
    // private _stages: ;

    public assets: AssetsMap | undefined;

    constructor(rootDir: FileSystemDirectoryHandle) {
        this._rootDir = rootDir;
    }

    public async build(dir: FileSystemDirectoryHandle = this._rootDir) {
        let binDir: FileSystemDirectoryHandle | undefined;

        for await (const entry of dir.values()) {
            if (entry.kind === 'directory' && entry.name === KnownDiskEntries.BinDir) {
                binDir = entry as FileSystemDirectoryHandle;
            } else if (entry.kind === 'file' && entry.name === KnownDiskEntries.ExeFile) {
                const fileHnd = await dir.getFileHandle(entry.name);
                this._builder = new MegaBuilder(await ExeFile.make(fileHnd));
            }
        }

        const start = performance.now();
        this.assets = await this._builder!.build(binDir!);

        console.info(`All done in ${performance.now() - start}ms`);
    }

    public getFileStructure(): TreeNode[] {
        if (!this.assets) {
            return [];
        }

        const nodes: TreeNode[] = [];
        for (const assetType in this.assets) {
            const node: TreeNode = {
                type: TreeNodeType.Directory,
                name: assetType,
                children: [],
            };

            for (const assetFileType of this.assets[assetType as AssetType].keys()) {
                const childNode: TreeNode = {
                    type: TreeNodeType.File,
                    name: assetFileType,
                };

                node.children.push(childNode);
            }

            nodes.push(node);
        }

        return nodes;
    }
}