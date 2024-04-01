import { FileSystemFileHandle } from 'native-file-system-adapter';
import { AssetType, AssetPack } from '../AssetPack';
import { TexturePackName } from '../Textures/TexturePack';
import { Model } from './Model';
import { ModelBuilder } from './ModelBuilder';

export enum ModelPackName {
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

enum TexturePackType {
    Common = 0,
    Matching = 6
}

export class ModelPack extends AssetPack {
    public readonly assetType: AssetType = AssetType.Model;
    public readonly isStage: boolean;

    public models: Model[] = [];

    constructor(file: FileSystemFileHandle) {
        super(file);

        this.isStage = file.name.startsWith("P_STG");
    }

    private _getAssociatedTexturePack(): TexturePackName | undefined {
        switch (this._fileHandle.name) {
            case ModelPackName.P_COMMON:
                return TexturePackName.T_COMMON;
            case ModelPackName.P_STG1C:
                return TexturePackName.T_STG1C;
            case ModelPackName.P_STG10:
                return TexturePackName.T_STG10;
            case ModelPackName.P_STG11:
                return TexturePackName.T_STG11;
            case ModelPackName.P_STG12:
                return TexturePackName.T_STG12;
            case ModelPackName.P_SEL:
                return TexturePackName.T_SELECT;
            case ModelPackName.P_STG2C:
                return TexturePackName.T_STG2C;
            case ModelPackName.P_STG20:
                return TexturePackName.T_STG20;
                // if (type === 7)
                //     return TextureFileName.T_STG2C;
                // else if (type === 6)
                //     return TextureFileName.T_STG20;
                // return undefined;
            case ModelPackName.P_STG21:
                return TexturePackName.T_STG21;
            case ModelPackName.P_STG22:
                return TexturePackName.T_STG22;
            case ModelPackName.P_STG3C:
                return TexturePackName.T_STG3C;
            case ModelPackName.P_STG30:
                return TexturePackName.T_STG30;
            case ModelPackName.P_STG31:
                return TexturePackName.T_STG31;
            case ModelPackName.P_STG32:
                return TexturePackName.T_STG32;
            case ModelPackName.P_FANG:
                return TexturePackName.T_FANG;
            case ModelPackName.P_ADV:
                return TexturePackName.T_ADV;
            case ModelPackName.P_MINI_C:
                return TexturePackName.T_MINI_C;

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

    public getTexturePackName(type: TexturePackType): TexturePackName | undefined {
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
        if (type === TexturePackType.Common) {
            return TexturePackName.T_COMMON;
        } else {

            return this._getAssociatedTexturePack();
        }
    }
}