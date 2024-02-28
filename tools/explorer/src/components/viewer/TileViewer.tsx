import { Card, Divider, Text } from '@geist-ui/core';
import { Tile } from '../../core/gamedata/Textures/TileMap';
import './TileViewer.css';
import { useContext, useEffect, useRef } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { AssetType } from '../../core/gamedata/PackedAssetsFile';
import { TextureFileName } from '../../core/gamedata/Textures/TexturesFile';

export type TileViewerProps = {
    textureFileName: TextureFileName;
    tile?: Tile;
}

function NoTileSelected() {
    return <Card.Content className='no-tile-selected' height="90%">
        <Text type='secondary' span h4>No tile selected...</Text>
        <Text type='secondary' span small>Select a tile to get more information about it</Text>
    </Card.Content>;
}

function TileViewerCard({ children }: React.PropsWithChildren) {
    return <Card width="100%">
        <Card.Content>
            <Text b>Tile Info</Text>
        </Card.Content>
        <Divider h="1px" my={0} />
        <Card.Content className='tile-viewer-main-content'>
            {children}
        </Card.Content>
    </Card>;
}

export function TileViewer({ textureFileName, tile }: TileViewerProps) {
    const mainCtx = useContext(MainContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef?.current || !tile || !mainCtx.gameData.assets) {
            console.error('err');
            return;
        }

        canvasRef.current.width = tile.rect.width;
        canvasRef.current.height = tile.rect.height;

        const textureFile = mainCtx.gameData.assets[AssetType.Texture].get(textureFileName);
        if (!textureFile) {
            console.error('No texture file');
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
            console.error('no ctx');
            return;
        }

        const texture = textureFile.getTexture(tile.textureId);
        const imageData = ctx.createImageData(tile.rect.width, tile.rect.height);
        imageData.data.set(texture.pixels);
        ctx.putImageData(imageData, 0, 0);

    }, [mainCtx.gameData.assets, textureFileName, tile]);

    if (!tile) {
        return <TileViewerCard>
            <NoTileSelected />
        </TileViewerCard>;
    }

    return <TileViewerCard>
        <canvas ref={canvasRef} className='tile-canvas'></canvas>
        {/* KONVA STAGE HERE */}
    </TileViewerCard>;
}