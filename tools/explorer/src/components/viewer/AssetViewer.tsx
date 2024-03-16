import { ModelPack } from '../../core/gamedata/Models/ModelPack';
import { AssetType, AssetPack } from '../../core/gamedata/AssetPack';
import { TexturePack } from '../../core/gamedata/Textures/TexturePack';
import { ModelViewer } from './model/ModelViewer';
import { TextureViewer } from './TextureViewer';
import { StageViewer } from './stage/StageViewer';

type AssetsViewerProps = {
    asset?: AssetPack;
}

export function AssetViewer({ asset }: AssetsViewerProps) {
    switch (asset?.assetType) {
        case AssetType.Texture:
            return <TextureViewer textureFile={asset as TexturePack} />;

        case AssetType.Model: {
            // return <ModelViewer models={asset as ModelPack} />;
            if (asset.name.includes('P_STG')) {
                return <StageViewer modelPack={asset as ModelPack} />;
            } else {
                return <ModelViewer models={asset as ModelPack} />;
            }
        }

        default:
            return;
    }
}