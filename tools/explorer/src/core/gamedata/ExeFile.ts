import { GameFile, GameFileType } from './GameFile';

const rawDataAddr: number = 0x0004D400;
const virtualDataAddr: number = 0x0044F000;

export class ExeFile extends GameFile {
    public readonly fileType: GameFileType = GameFileType.Exe;

    public static toRawAddr(addr: number): number {
        const rawAddr = addr - virtualDataAddr + rawDataAddr;
        if (rawAddr < 0) {
            console.warn(`Invalid virtual address 0x${addr.toString(16)}`);
        }

        return rawAddr;
    }
}