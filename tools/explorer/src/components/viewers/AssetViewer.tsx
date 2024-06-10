import { AssetName, AssetPack, AssetType, GameData, ModelPack, TexturePack } from '@VCRE/core/gamedata';
import { LoaderFunctionArgs, redirect, useLoaderData } from 'react-router-dom';

import { ModelPackViewer } from './ModelPack/ModelPackViewer';
import { StageViewer } from './Stage/StageViewer';
import { TexturePackViewer } from './TexturePack/TexturePackViewer';

type AssetViewerLoaderData = {
    asset: AssetPack;
    assetId?: number;
}

export function AssetViewer() {
    const loaderData = useLoaderData() as AssetViewerLoaderData;

    switch (loaderData.asset.assetType) {
        case AssetType.Texture:
            return <TexturePackViewer texturePack={loaderData.asset as TexturePack} textureId={loaderData.assetId} />;

        case AssetType.Model: {
            // return <ModelPackViewer modelPack={asset as ModelPack} />;
            const modelPack = loaderData.asset as ModelPack;
            if (modelPack.isStage) {
                return <StageViewer modelPack={modelPack} />;
            } else {
                return <ModelPackViewer modelPack={modelPack} modelId={loaderData.assetId} />;
            }
        }

        default:
            return;
    }
}

AssetViewer.loader = function({ params }: LoaderFunctionArgs): AssetViewerLoaderData | Response | null {
    const assetType = params.assetType as AssetType;
    const assetFileName = params.assetFileName as AssetName;
    if (!assetType || !assetFileName) {
        console.error(`Unable to find ${assetType}/${assetFileName}`);
        return null;
    }

    const gameData = GameData.get();
    if (!gameData.assets) {
        console.error('No assets in game data. (did you call init?)');
        return null;
    }
    const asset = gameData.assets[assetType].get(assetFileName);
    if (!asset) {
        console.warn(`Unable to find ${assetFileName} in game data`);
        return redirect('/');
    }

    const assetId = parseInt(params.assetId as string);
    return {
        asset,
        assetId: Number.isNaN(assetId) ? undefined : assetId
    };
};
