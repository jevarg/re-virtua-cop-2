import { ModelsFile } from '../../core/gamedata/Models/ModelsFile';
import { AssetType, PackedAssetsFile } from '../../core/gamedata/PackedAssetsFile';
import { TexturesFile } from '../../core/gamedata/Textures/TexturesFile';
import { ModelViewer } from './ModelViewer';
import { TextureViewer } from './TextureViewer';

type AssetsViewerProps = {
    asset?: PackedAssetsFile;
}

export function AssetViewer({ asset }: AssetsViewerProps) {
    switch (asset?.assetType) {
        case AssetType.Texture:
            return <TextureViewer textureFile={asset as TexturesFile} />;

        case AssetType.Model:
            return <ModelViewer models={asset as ModelsFile} />;

        default:
            return;
    }
}