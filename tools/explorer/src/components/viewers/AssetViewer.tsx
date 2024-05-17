import { AssetName, AssetPack, AssetType, GameData, ModelPack, TexturePack } from '@VCRE/core/gamedata';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import { ModelViewer } from './Model/ModelViewer';
import { ModelPackViewer } from './ModelPack/ModelPackViewer';
import { StageViewer } from './Stage/StageViewer';
import { TextureViewer } from './Texture/TextureViewer';

export function AssetViewer() {
    const asset = useLoaderData() as AssetPack;

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

AssetViewer.loader = function({ params }: LoaderFunctionArgs) {
    const assetType = params.assetType as AssetType;
    const assetName = params.assetName as AssetName;
    if (!assetType || !assetName) {
        console.error(`Unable to find ${assetType}/${assetName}`);
        return null;
    }

    const gameData = GameData.get();
    if (!gameData.assets) {
        console.error('No assets in game data. (did you call init?)');
        return null;
    }
    const asset = gameData.assets[assetType].get(assetName);
    if (!asset) {
        console.warn(`Unable to find ${assetName} in game data`);
        return null; // TODO: redirect
    }

    return asset;
};
