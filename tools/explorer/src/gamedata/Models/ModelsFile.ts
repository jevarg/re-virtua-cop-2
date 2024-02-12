import { FileType, GameFile } from '../GameFile';

export enum ModelFileType {
    P_COMMON = 'P_COMMON.BIN',
    P_STG1C = 'P_STG1C.BIN',
    P_STG10 = 'P_STG10.BIN',
    P_STG11 = 'P_STG11.BIN',
    P_STG12 = 'P_STG12.BIN',
    P_OPTION = 'P_OPTION.BIN',
    P_SEL = 'P_SEL.BIN',
    P_STG2C = 'P_STG2C.BIN',
    P_STG20 = 'P_STG20.BIN',
    P_STG21 = 'P_STG21.BIN',
    P_STG22 = 'P_STG22.BIN',
    P_STG3C = 'P_STG3C.BIN',
    P_STG30 = 'P_STG30.BIN',
    P_STG31 = 'P_STG31.BIN',
    P_STG32 = 'P_STG32.BIN',
    P_FANG = 'P_FANG.BIN',
    P_ADV = 'P_ADV.BIN',
    P_NAME = 'P_NAME.BIN',
    P_MINI_C = 'P_MINI_C.BIN',
}

export class ModelsFile extends GameFile {
    public readonly type: FileType = FileType.Model;
}