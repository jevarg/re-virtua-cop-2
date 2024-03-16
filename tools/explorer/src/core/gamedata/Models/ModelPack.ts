import { AssetType, AssetPack } from '../AssetPack';
import { TextureFileName } from '../Textures/TexturePack';
import { Model } from './Model';
import { ModelBuilder } from './ModelBuilder';

export enum ModelFileName {
    P_COMMON = 'P_COMMON.BIN',
    P_STG1C = 'P_STG1C.BIN',
    P_STG10 = 'P_STG10.BIN',
    P_STG11 = 'P_STG11.BIN',
    P_STG12 = 'P_STG12.BIN',
    // P_OPTION = 'P_OPTION.BIN',
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

enum TexturePackIdType {
    Common = 0,
    Matching = 6
}

export class ModelPack extends AssetPack {
    public readonly assetType: AssetType = AssetType.Model;
    public models: Model[] = [];

    private _getAssociatedTexturePack(): TextureFileName | undefined {
        switch (this._fileHandle.name) {
            case ModelFileName.P_COMMON:
                return TextureFileName.T_COMMON;
            case ModelFileName.P_STG1C:
                return TextureFileName.T_STG1C;
            case ModelFileName.P_STG10:
                return TextureFileName.T_STG10;
            case ModelFileName.P_STG11:
                return TextureFileName.T_STG11;
            case ModelFileName.P_STG12:
                return TextureFileName.T_STG12;
            case ModelFileName.P_SEL:
                return TextureFileName.T_SELECT;
            case ModelFileName.P_STG2C:
                return TextureFileName.T_STG2C;
            case ModelFileName.P_STG20:
                return TextureFileName.T_STG20;
                // if (type === 7)
                //     return TextureFileName.T_STG2C;
                // else if (type === 6)
                //     return TextureFileName.T_STG20;
                // return undefined;
            case ModelFileName.P_STG21:
                return TextureFileName.T_STG21;
            case ModelFileName.P_STG22:
                return TextureFileName.T_STG22;
            case ModelFileName.P_STG3C:
                return TextureFileName.T_STG3C;
            case ModelFileName.P_STG30:
                return TextureFileName.T_STG30;
            case ModelFileName.P_STG31:
                return TextureFileName.T_STG31;
            case ModelFileName.P_STG32:
                return TextureFileName.T_STG32;
            case ModelFileName.P_FANG:
                return TextureFileName.T_FANG;
            case ModelFileName.P_ADV:
                return TextureFileName.T_ADV;
            case ModelFileName.P_MINI_C:
                return TextureFileName.T_MINI_C;

        default:
                return undefined;
        }
    }

    protected override async _init(): Promise<void> {
        await super._init();

        let id = 0;
        while (true) {
            const model = ModelBuilder.build(id++, this, this.buffer);
            if (!model) {
                break; // All models have been read
            }

            this.models.push(model);
        }
    }

    public getModel(id: number): Model | undefined {
        return this.models[id];
    }

    public getTexturePackName(type: TexturePackIdType): TextureFileName | undefined {
        // switch (type) {
        //     case TexturePackIdType.Common:
        //         return TextureFileName.T_COMMON;
        //     case 6: {
        //         let name = this._fileHandle.name.substring(0, this._fileHandle.name.length - 5); // .BIN
        //         name += '';
        //         break;
        //     }
        //     default:
        //         break;
        // }
        if (type === TexturePackIdType.Common) {
            return TextureFileName.T_COMMON;
        } else {

            return this._getAssociatedTexturePack();
        }
    }
}