import { FileSystemDirectoryHandle } from 'native-file-system-adapter';
import { TextureFileName, TexturePack } from './Textures/TexturePack';
import { ExeFile } from './ExeFile';
import { Palette } from './Textures/PaletteFile';
import { TextureInfo } from './Textures/TextureInfo';
import { AssetType } from './AssetPack';
import { ModelFileName, ModelPack } from './Models/ModelPack';

const texturesListAddr: number = ExeFile.toRawAddr(0x00458FD0);
const textureListItemByteSize: number = 24;

export type AssetsMap = Record<AssetType.Texture, Map<TextureFileName, TexturePack>>
                        & Record<AssetType.Model, Map<ModelFileName, ModelPack>>

export class MegaBuilder {
    private _exeFile: ExeFile;

    constructor(exeFile: ExeFile) {
        this._exeFile = exeFile;
    }

    private async _makeTexture(assetsDir: FileSystemDirectoryHandle, textureItemOffset: number): Promise<TexturePack | undefined> {
        const dataView = new DataView(this._exeFile.buffer);

        const fileNameOffset = ExeFile.toRawAddr(dataView.getUint32(textureItemOffset, true));
        const paletteFileNameOffset = ExeFile.toRawAddr(dataView.getUint32(textureItemOffset + 4, true));
        const texturesMetadataOffset = ExeFile.toRawAddr(dataView.getUint32(textureItemOffset + 8, true));
        const fileOffset = dataView.getUint8(textureItemOffset + 12);
        const unk = dataView.getUint8(textureItemOffset + 13);
        const texturesCountOffset = ExeFile.toRawAddr(dataView.getUint32(textureItemOffset + 16, true));

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
            return TexturePack.make(fileHandle, palette, count, metadata, fileOffset, unk);
        } catch (err) {
            if ((err as { name?: string })?.name === 'NotFoundError') {
                console.info(`Skipped ${fileName}: ${err}`);
                return;
            }

            throw err;
        }
    }

    private async _makeTextures(assetsDir: FileSystemDirectoryHandle): Promise<Map<TextureFileName, TexturePack>> {
        const numberOfTextures = Object.keys(TextureFileName).length;
        const texturesMap = new Map<TextureFileName, TexturePack>();

        const promises: Promise<TexturePack | undefined>[] = [];
        for (let i = 0; i < numberOfTextures; i++) {
            promises.push(this._makeTexture(assetsDir, texturesListAddr + textureListItemByteSize * i));
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

    private async _makeModels(assetsDir: FileSystemDirectoryHandle): Promise<Map<ModelFileName, ModelPack>> {
        const modelsMap = new Map<ModelFileName, ModelPack>();

        for (const fileName of Object.values(ModelFileName)) {
            const file = await assetsDir.getFileHandle(fileName);
            modelsMap.set(fileName as ModelFileName, await ModelPack.make(file));
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
