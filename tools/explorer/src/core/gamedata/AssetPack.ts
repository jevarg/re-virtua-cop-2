import { GameFile, GameFileType } from './GameFile';
import { ModelPackName } from './Models/ModelPack';
import { TexturePackName } from './Textures/TexturePack';

export enum AssetType {
    Texture = 'Texture',
    Model = 'Model',
}

export type TextureFileType = {
    assetType: AssetType.Texture;
    fileName: TexturePackName;
}

export type ModelFileType = {
    assetType: AssetType.Model;
    fileName: ModelPackName;
}

export type AssetFileType = TextureFileType | ModelFileType;

export abstract class AssetPack extends GameFile {
    public readonly fileType: GameFileType = GameFileType.PackedAsset;
    public abstract readonly assetType: AssetType;
}
