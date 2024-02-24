import { GameFile, GameFileType } from './GameFile';
import { ModelFileName } from './Models/ModelsFile';
import { TextureFileName } from './Textures/TexturesFile';

export enum AssetType {
    Texture = 'Texture',
    Model = 'Model',
}

export type TextureFileType = {
    assetType: AssetType.Texture;
    fileName: TextureFileName;
}

export type ModelFileType = {
    assetType: AssetType.Model;
    fileName: ModelFileName;
}

export type AssetFileType = TextureFileType | ModelFileType;

export abstract class PackedAssetsFile extends GameFile {
    public readonly fileType: GameFileType = GameFileType.PackedAsset;
    public abstract readonly assetType: AssetType;
}