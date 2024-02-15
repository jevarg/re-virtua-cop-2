import { GameFile, GameFileType } from './GameFile';

export enum AssetType {
    Texture = 'Texture',
    Palette = 'Palette',
    Model = 'Model',
}

export abstract class PackedAssetsFile extends GameFile {
    public readonly fileType: GameFileType = GameFileType.PackedAsset;

    public abstract readonly assetType: AssetType;
    public abstract unpack(): Promise<void>;
}