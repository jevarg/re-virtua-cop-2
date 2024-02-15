import { FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle } from 'native-file-system-adapter';
import { TexturesFile, TextureFileType } from './Textures/TexturesFile';
import { PaletteFile, PaletteFileType } from './Textures/PaletteFile';
import { ModelFileType, ModelsFile } from './Models/ModelsFile';
import { MegaBuilder } from './MegaBuilder';
import { DirNode, TreeNode, TreeNodeType } from './FSTree';
import { AssetType, PackedAssetsFile } from './PackedAssetsFile';

const knownFolders = [
    'BIN'
];

const typePrefixes: Record<string, AssetType> = {
    'T_': AssetType.Texture,
    'L_': AssetType.Palette,
    'P_': AssetType.Model,
};

type PathConfig = {
    builder: (dir: FileSystemDirectoryHandle, entry: FileSystemHandle) => Promise<void>,
    files: string[]
}

export class VC2GameData {
    private readonly _builderConfig: Record<string, PathConfig> = {
        BIN: {
            builder: this._buildAssetEntry.bind(this),
            files: [
                ...Object.values(TextureFileType),
                ...Object.values(PaletteFileType),
                ...Object.values(ModelFileType),
            ]
        },
    };
    private readonly _rootDir: FileSystemDirectoryHandle;

    public _builder?: MegaBuilder;
    public _assets: Partial<Record<AssetType, PackedAssetsFile[]>> = {
        [AssetType.Texture]: [],
        [AssetType.Palette]: [],
        [AssetType.Model]: [],
    };

    constructor(rootDir: FileSystemDirectoryHandle) {
        this._rootDir = rootDir;
        this._builderConfig[rootDir.name] = {
            builder: this._buildExeEntry.bind(this),
            files: ['PPJ2DD.EXE']
        };
    }

    public buildFileTree(): TreeNode[] {
        const tree: TreeNode[] = [
            { type: TreeNodeType.File, name: this._builder!.name },
        ];

        for (const [fileType, files] of Object.entries(this._assets)) {
            const dir: DirNode = {
                type: TreeNodeType.Directory,
                name: `${fileType}s`,
                children: []
            };

            for (const file of files) {
                dir.children.push({
                    type: TreeNodeType.File,
                    name: file.name
                });
            }

            tree.push(dir);
        }

        return tree;
    }

    private _buildPackedAssetFile(type: AssetType, fileHandle: FileSystemFileHandle): PackedAssetsFile | undefined {
        switch (type) {
            case AssetType.Texture:
                return new TexturesFile(fileHandle);

            case AssetType.Palette:
                return new PaletteFile(fileHandle);

            case AssetType.Model:
                return new ModelsFile(fileHandle);

            default:
                return undefined;
        }
    }

    private _guessAssetType(name: string): AssetType | undefined {
        for (const prefix in typePrefixes) {
            if (name.startsWith(prefix)) {
                return typePrefixes[prefix];
            }
        }

        return undefined;
    }

    private async _buildAssetEntry(dir: FileSystemDirectoryHandle, entry: FileSystemHandle) {
        const fileType = this._guessAssetType(entry.name);
        if (!fileType) {
            return;
        }

        const asset = this._buildPackedAssetFile(fileType, await dir.getFileHandle(entry.name));
        if (!asset) {
            console.error(`Could not build GameFile for ${entry}`);
            return;
        }

        this._assets[fileType]?.push(asset);
    }

    private async _buildExeEntry(dir: FileSystemDirectoryHandle, entry: FileSystemHandle) {
        const fileHandle = await dir.getFileHandle(entry.name);
        this._builder = new MegaBuilder(fileHandle);
    }

    public async build(dir: FileSystemDirectoryHandle = this._rootDir) {
        for await (const entry of dir.values()) {
            if (entry.kind === 'directory' && knownFolders.includes(entry.name) && entry instanceof FileSystemDirectoryHandle) {
                await this.build(entry);
            } else if (entry.kind === 'file') {
                const pathConfig = this._builderConfig[dir.name];
                if (!pathConfig?.files.includes(entry.name)) {
                    continue;
                }

                await pathConfig.builder(dir, entry);
            }
        }
    }
}