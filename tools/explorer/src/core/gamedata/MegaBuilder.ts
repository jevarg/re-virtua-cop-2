import { FileSystemDirectoryHandle, FileSystemFileHandle } from 'native-file-system-adapter';
import { TextureFileType, TexturesFile } from './Textures/TexturesFile';
import { ExeFile } from './ExeFile';
import { PaletteFile } from './Textures/PaletteFile';

const texturesAddr: number = 0x00458FD0;

export class MegaBuilder {
    private _exeFile: ExeFile;

    constructor(exeFileHandle: FileSystemFileHandle) {
        this._exeFile = new ExeFile(exeFileHandle);
    }

    public async makeTextures(assetsDir: FileSystemDirectoryHandle) {
        const numberOfTextures = Object.keys(TextureFileType).length;

        const start = ExeFile.toRawAddr(texturesAddr);
        const end = start + (numberOfTextures * 24);

        const bytes = new Uint32Array(this._exeFile.buffer.slice(start, end));

        const texturesMap = new Map<string, TexturesFile>();
        for (let i = 0; i < numberOfTextures * 6; i += 2) {
            const fileNameOffset = ExeFile.toRawAddr(bytes[i++]);
            const paletteFileNameOffset = ExeFile.toRawAddr(bytes[i++]);
            const texturesMetadataOffset = ExeFile.toRawAddr(bytes[i++]);
            const texturesCountOffset = ExeFile.toRawAddr(bytes[++i]);

            const fileName = this._exeFile.buffer.asciiAt(fileNameOffset, 12);
            const paletteFileName = this._exeFile.buffer.asciiAt(paletteFileNameOffset, 12);
            const count = this._exeFile.buffer.uInt32At(texturesCountOffset);

            try {
                const [ fileHandle, paletteFileHandle ] = await Promise.all([
                    await assetsDir.getFileHandle(fileName),
                    await assetsDir.getFileHandle(paletteFileName)
                ]);
                
                const texturesFile = new TexturesFile(fileHandle, new PaletteFile(paletteFileHandle));
                texturesMap.set(fileName, texturesFile);
            } catch (err) {
                console.error('Skipped fileName.', err);
            }
        }

        console.log(texturesMap);
    }
}
