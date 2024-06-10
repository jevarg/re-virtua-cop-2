import './TextureInfo.css';

import { Spacer, Tag, Tooltip } from '@geist-ui/core';
import Card from '@geist-ui/core/esm/card/card';
import CardContent from '@geist-ui/core/esm/card/card-content';
import Divider from '@geist-ui/core/esm/divider/divider';
import Text from '@geist-ui/core/esm/text/text';
import { AssetType, GameData, Texture, TextureFlag, TexturePackName, Tile } from '@VCRE/core/gamedata';
import { useEffect, useMemo, useRef } from 'react';

export type TextureInfoProps = {
    texture?: Texture;
}

type TextureInfoDetailsProps = {
    texture: Texture;
}

function NoTileSelected() {
    return <CardContent className='no-tile-selected' height="90%">
        <Text type='secondary' span h4>No tile selected...</Text>
        <Text type='secondary' span small>Select a tile to get more information about it</Text>
    </CardContent>;
}

function TextureInfoDetails({ texture }: TextureInfoDetailsProps) {
    return <>
        <div className='tile-info'>
            <Text p b>
                ID: <Text small>{texture.id}</Text>
            </Text>
            <Text p b>
                Width: <Text small>{texture.info.width}</Text>
            </Text>
            <Text p b>
                Height: <Text small>{texture.info.height}</Text>
            </Text>
            <Text p b>
                Palette Offset: <Text small>0x{texture.info.paletteOffset.toString(16)}</Text>
            </Text>
            <Text p b>
                {texture.info.hasFlag(TextureFlag.Alpha) && <>
                    <Tooltip text='Has transparency'>
                        <Tag scale={0.5}>Alpha</Tag>
                    </Tooltip>
                </>}
                &nbsp;
                {texture.info.hasFlag(TextureFlag.UI) && <>
                    <Tooltip text='2D UI texture'>
                        <Tag scale={0.5}>UI</Tag>
                    </Tooltip>
                </>}
            </Text>
        </div>
    </>;
}

function TextureInfoCard({ children }: React.PropsWithChildren) {
    return <Card width="100%">
        <CardContent>
            <Text b>Texture Info</Text>
        </CardContent>
        <Divider h="1px" my={0} />
        <CardContent padding={0} marginTop={0} className='tile-viewer-main-content'>
            {children}
        </CardContent>
    </Card>;
}

export function TextureInfo({ texture }: TextureInfoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef?.current || !texture) {
            console.error('err');
            return undefined;
        }

        canvasRef.current.width = texture.info.width;
        canvasRef.current.height = texture.info.height;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
            console.error('no ctx');
            return undefined;
        }

        const imageData = ctx.createImageData(texture.info.width, texture.info.height);
        imageData.data.set(texture.pixels);
        ctx.putImageData(imageData, 0, 0);
    }, [texture]);

    if (!texture) {
        return <TextureInfoCard>
            <NoTileSelected />
        </TextureInfoCard>;
    }

    return <TextureInfoCard>
        <div className='tile-canvas-wrapper'>
            {/* KONVA STAGE HERE */}
            <canvas ref={canvasRef} className='tile-canvas'></canvas>
        </div>
        <TextureInfoDetails texture={texture} />
    </TextureInfoCard>;
}