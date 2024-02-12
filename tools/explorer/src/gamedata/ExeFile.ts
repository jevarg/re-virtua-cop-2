import { FileType, GameFile } from './GameFile';

export class ExeFile extends GameFile {
    public readonly type: FileType = FileType.Exe;
}