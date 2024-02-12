import { FileType, GameFile } from '../GameFile';

export enum TextureFileType {
    T_COMMON = 'T_COMMON.BIN',
    T_STG1C = 'T_STG1C.BIN',
    T_STG10 = 'T_STG10.BIN',
    T_STG11 = 'T_STG11.BIN',
    T_STG12 = 'T_STG12.BIN',
    T_OPTION = 'T_OPTION.BIN',
    T_SELECT = 'T_SELECT.BIN',
    T_STG2C = 'T_STG2C.BIN',
    T_STG20 = 'T_STG20.BIN',
    T_STG21 = 'T_STG21.BIN',
    T_STG22 = 'T_STG22.BIN',
    T_STG3C = 'T_STG3C.BIN',
    T_STG30 = 'T_STG30.BIN',
    T_STG31 = 'T_STG31.BIN',
    T_STG32 = 'T_STG32.BIN',
    T_FANG = 'T_FANG.BIN',
    T_ADV = 'T_ADV.BIN',
    T_NAME = 'T_NAME.BIN',
    T_LOGO = 'T_LOGO.BIN',
    T_TITLE = 'T_TITLE.BIN',
    T_MINI_C = 'T_MINI_C.BIN',
    T_RANK = 'T_RANK.BIN',
}

export class TextureFile extends GameFile {
    public readonly type: FileType = FileType.Texture;
}