import { FileSystemDirectoryHandle } from 'native-file-system-adapter';
import { MegaBuilder } from './MegaBuilder';
import { ExeFile } from './ExeFile';
import { TextureFileType, TexturesFile } from './Textures/TexturesFile';
import { TreeNode, TreeNodeType } from './FSTree';
import prettyBytes from 'pretty-bytes';

enum KnownEntries {
    ExeFile = 'PPJ2DD.EXE',
    BinDir = 'BIN'
}

export class VC2GameData {
    private readonly _rootDir: FileSystemDirectoryHandle;

    private _builder?: MegaBuilder;
    public textureFiles = new Map<TextureFileType, TexturesFile>();

    constructor(rootDir: FileSystemDirectoryHandle) {
        this._rootDir = rootDir;
    }

    public async build(dir: FileSystemDirectoryHandle = this._rootDir) {
        let binDir: FileSystemDirectoryHandle | undefined;

        for await (const entry of dir.values()) {
            if (entry.kind === 'directory' && entry.name === KnownEntries.BinDir) {
                binDir = entry as FileSystemDirectoryHandle;
            } else if (entry.kind === 'file' && entry.name === KnownEntries.ExeFile) {
                const fileHnd = await dir.getFileHandle(entry.name);
                this._builder = new MegaBuilder(await ExeFile.make(fileHnd));
            }
        }

        const start = performance.now();
        this.textureFiles = await this._builder!.makeTextures(binDir!);

        console.info(`All done in ${performance.now() - start}ms`);
    }

    public getFileStructure(): TreeNode[] {
        const texturesNode: TreeNode = {
            type: TreeNodeType.Directory,
            name: 'Textures',
            children: [],
        };

        for (const [textureFileType, textureFile] of this.textureFiles) {
            const textureTypeNode: TreeNode = {
                type: TreeNodeType.Directory,
                name: textureFileType,
                extra: `${textureFile.textures.length} texture(s)`,
                children: []
            };

            for (const [textureId, texture] of textureFile.textures.entries()) {
                textureTypeNode.children.push({
                    type: TreeNodeType.File,
                    name: textureId.toString(),
                    extra: prettyBytes(texture.pixels.byteLength)
                });
            }

            texturesNode.children.push(textureTypeNode);
        }

        return [
            texturesNode
        ];
    }
}