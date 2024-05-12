import { ModelPack } from '../../core/gamedata/Models/ModelPack';
import { AssetType, AssetPack } from '../../core/gamedata/AssetPack';
import { TexturePack } from '../../core/gamedata/Textures/TexturePack';
import { ModelViewer } from './model/ModelViewer';
import { TextureViewer } from './TextureViewer';
import { StageViewer } from './stage/StageViewer';
import { ModelPackViewer } from './model-pack/ModelPackViewer';

type AssetsViewerProps = {
    asset?: AssetPack;
}

export function AssetViewer({ asset }: AssetsViewerProps) {
    switch (asset?.assetType) {
        case AssetType.Texture:
            return <TextureViewer textureFile={asset as TexturePack} />;

        case AssetType.Model: {
            return <ModelPackViewer modelPack={asset as ModelPack} />;
            const modelPack = asset as ModelPack;
            if (modelPack.isStage) {
                return <StageViewer modelPack={modelPack} />;
            } else {
                return <ModelViewer model={modelPack.models[3]} />;
            }
        }

        default:
            return;
    }
}