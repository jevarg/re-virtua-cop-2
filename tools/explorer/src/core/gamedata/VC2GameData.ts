import { FileSystemDirectoryHandle } from 'native-file-system-adapter';
import { AssetsMap, MegaBuilder } from './MegaBuilder';
import { ExeFile } from './ExeFile';
import { TextureFileName, TexturesFile } from './Textures/TexturesFile';
import { TreeNode, TreeNodeType } from './FSTree';
import prettyBytes from 'pretty-bytes';
import { ModelFileName, ModelsFile } from './Models/ModelsFile';
import { AssetType } from './PackedAssetsFile';

enum KnownEntries {
    ExeFile = 'PPJ2DD.EXE',
    BinDir = 'BIN'
}

export class VC2GameData {
    private readonly _rootDir: FileSystemDirectoryHandle;

    private _builder?: MegaBuilder;
    // public textureFiles = new Map<TextureFileType, TexturesFile>();
    // public modelFiles = new Map<ModelFileType, ModelsFile>();
    public assets: AssetsMap | undefined;

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
                    // extra: `${texturesFile.textures.length} texture(s)`,
                };

                node.children.push(childNode);
            }

            nodes.push(node);
        }
        // const texturesNode: TreeNode = {
        //     type: TreeNodeType.Directory,
        //     name: 'Textures',
        //     children: [],
        // };

        // for (const [textureFileType, texturesFile] of this.textureFiles) {
        //     const textureTypeNode: TreeNode = {
        //         type: TreeNodeType.File,
        //         name: textureFileType,
        //         extra: `${texturesFile.textures.length} texture(s)`,
        //     };

        //     texturesNode.children.push(textureTypeNode);
        // }

        // const modelsNode: TreeNode = {
        //     type: TreeNodeType.Directory,
        //     name: 'Models',
        //     children: [],
        // };

        // for (const [modelFileType, modelsFile] of this.modelFiles) {
        //     const modelsTypeNode: TreeNode = {
        //         type: TreeNodeType.File,
        //         name: modelFileType,
        //         extra: `${modelsFile.models.length} models(s)`,
        //     };

        //     modelsNode.children.push(modelsTypeNode);
        // }

        // return [
        //     texturesNode,
        //     modelsNode
        // ];
        return nodes;
    }
}