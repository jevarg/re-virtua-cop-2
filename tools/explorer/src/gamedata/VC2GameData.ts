import { FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle } from 'native-file-system-adapter';
import { FileType, GameFile } from './GameFile';
import { TextureFile, TextureFileType } from './Textures/TexturesFile';
import { PaletteFile, PaletteFileType } from './Textures/PaletteFile';
import { ModelFileType, ModelsFile } from './Models/ModelsFile';
import { ExeFile } from './ExeFile';
import { DirNode, TreeNode, TreeNodeType } from './FSTree';

const knownFolders = [
    'BIN'
];

const typePrefixes: Record<string, FileType> = {
    'T_': FileType.Texture,
    'L_': FileType.Palette,
    'P_': FileType.Model,
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

    public _exeFile?: ExeFile;
    public _assets: Partial<Record<FileType, GameFile[]>> = {
        [FileType.Texture]: [],
        [FileType.Palette]: [],
        [FileType.Model]: [],
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
            { type: TreeNodeType.File, name: this._exeFile!.name },
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

    private _buildGameFile(type: FileType, fileHandle: FileSystemFileHandle): GameFile | undefined {
        switch (type) {
            case FileType.Exe:
                return new ExeFile(fileHandle);

            case FileType.Texture:
                return new TextureFile(fileHandle);

            case FileType.Palette:
                return new PaletteFile(fileHandle);

            case FileType.Model:
                return new ModelsFile(fileHandle);

            default:
                return undefined;
        }
    }

    private _guessFileType(name: string): FileType | undefined {
        for (const prefix in typePrefixes) {
            if (name.startsWith(prefix)) {
                return typePrefixes[prefix];
            }
        }

        return undefined;
    }

    private async _buildAssetEntry(dir: FileSystemDirectoryHandle, entry: FileSystemHandle) {
        const fileType = this._guessFileType(entry.name);
        if (!fileType) {
            return;
        }

        const gameFile = this._buildGameFile(fileType, await dir.getFileHandle(entry.name));
        if (!gameFile) {
            console.error(`Could not build GameFile for ${entry}`);
            return;
        }

        this._assets[fileType]?.push(gameFile);
    }

    private async _buildExeEntry(dir: FileSystemDirectoryHandle, entry: FileSystemHandle) {
        const fileHandle = await dir.getFileHandle(entry.name);
        this._exeFile = new ExeFile(fileHandle);
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