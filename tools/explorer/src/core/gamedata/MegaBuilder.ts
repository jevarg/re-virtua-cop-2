import { FileSystemDirectoryHandle } from 'native-file-system-adapter';
import { TextureFileName, TexturesFile } from './Textures/TexturesFile';
import { ExeFile } from './ExeFile';
import { Palette } from './Textures/PaletteFile';
import { TextureInfo } from './Textures/TextureInfo';
import { AssetType } from './PackedAssetsFile';
import { ModelFileName, ModelsFile } from './Models/ModelsFile';

const texturesAddr: number = 0x00458FD0;

export type AssetsMap = Record<AssetType.Texture, Map<TextureFileName, TexturesFile>>
                        & Record<AssetType.Model, Map<ModelFileName, ModelsFile>>

export class MegaBuilder {
    private _exeFile: ExeFile;

    constructor(exeFile: ExeFile) {
        this._exeFile = exeFile;
    }

    private async _makeTexture(assetsDir: FileSystemDirectoryHandle, i: number, bytes: Uint32Array): Promise<TexturesFile | undefined> {
        const fileNameOffset = ExeFile.toRawAddr(bytes[i]);
        const paletteFileNameOffset = ExeFile.toRawAddr(bytes[i + 1]);
        const texturesMetadataOffset = ExeFile.toRawAddr(bytes[i + 2]);
        const texturesCountOffset = ExeFile.toRawAddr(bytes[i + 4]);

        const dataView = new DataView(this._exeFile.buffer);

        const fileName = dataView.getAscii(fileNameOffset, 12);
        const paletteFileName = dataView.getAscii(paletteFileNameOffset, 12);

        try {
            const [ fileHandle, paletteFileHandle ] = await Promise.all([
                await assetsDir.getFileHandle(fileName),
                await assetsDir.getFileHandle(paletteFileName)
            ]);

            const count = dataView.getUint32(texturesCountOffset, true);
            const metadata = this._exeFile.buffer.sliceAt(texturesMetadataOffset, TextureInfo.byteSize * count);

            const palette = await Palette.make(paletteFileHandle);
            return TexturesFile.make(fileHandle, palette, count, metadata);
        } catch (err) {
            if ((err as { name?: string })?.name === 'NotFoundError') {
                console.info(`Skipped ${fileName}: ${err}`);
                return;
            }

            throw err;
        }
    }

    private async _makeTextures(assetsDir: FileSystemDirectoryHandle): Promise<Map<TextureFileName, TexturesFile>> {
        const numberOfTextures = Object.keys(TextureFileName).length;

        const start = ExeFile.toRawAddr(texturesAddr);
        const end = start + (numberOfTextures * 24);

        const bytes = new Uint32Array(this._exeFile.buffer.slice(start, end));

        const texturesMap = new Map<TextureFileName, TexturesFile>();
        const promises: Promise<TexturesFile | undefined>[] = [];
        for (let i = 0; i < numberOfTextures * 6; i += 6) {
            promises.push(this._makeTexture(assetsDir, i, bytes));
        }

        const textures = await Promise.all(promises);
        for (const texture of textures) {
            if (!texture) {
                continue;
            }

            texturesMap.set(texture.name as TextureFileName, texture);
        }

        return texturesMap;
    }

    private async _makeModels(assetsDir: FileSystemDirectoryHandle): Promise<Map<ModelFileName, ModelsFile>> {
        const modelsMap = new Map<ModelFileName, ModelsFile>();

        for (const fileName of Object.values(ModelFileName)) {
            const file = await assetsDir.getFileHandle(fileName);
            modelsMap.set(fileName as ModelFileName, await ModelsFile.make(file));
        }

        return modelsMap;
    }

    public async build(assetsDir: FileSystemDirectoryHandle): Promise<AssetsMap> {
        const [textures, models] = await Promise.all([
            this._makeTextures(assetsDir),
            this._makeModels(assetsDir)
        ]);


        return {
            [AssetType.Texture]: textures,
            [AssetType.Model]: models
        };
    }
}
