import { AssetType, PackedAssetsFile } from '../PackedAssetsFile';

export enum PaletteFileType {
    L_COMMON = 'L_COMMON.BIN',
    L_STG1C = 'L_STG1C.BIN',
    L_STG10 = 'L_STG10.BIN',
    L_STG11 = 'L_STG11.BIN',
    L_STG12 = 'L_STG12.BIN',
    L_OPTION = 'L_OPTION.BIN',
    L_SELECT = 'L_SELECT.BIN',
    L_STG2C = 'L_STG2C.BIN',
    L_STG20 = 'L_STG20.BIN',
    L_STG21 = 'L_STG21.BIN',
    L_STG22 = 'L_STG22.BIN',
    L_STG3C = 'L_STG3C.BIN',
    L_STG30 = 'L_STG30.BIN',
    L_STG31 = 'L_STG31.BIN',
    L_STG32 = 'L_STG32.BIN',
    L_FANG = 'L_FANG.BIN',
    L_ADV = 'L_ADV.BIN',
    L_NAME = 'L_NAME.BIN',
    L_LOGO = 'L_LOGO.BIN',
    L_TITLE = 'L_TITLE.BIN',
    L_MINI_C = 'L_MINI_C.BIN',
    L_RANK = 'L_RANK.BIN',
}

export class PaletteFile extends PackedAssetsFile {
    public readonly assetType: AssetType = AssetType.Palette;
    
    public unpack(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}