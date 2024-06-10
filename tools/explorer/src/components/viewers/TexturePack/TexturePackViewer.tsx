import './TexturePackViewer.css';

import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Spacer from '@geist-ui/core/esm/spacer/spacer';
import TableColumn from '@geist-ui/core/esm/table/table-column';
import Tag from '@geist-ui/core/esm/tag';
import Text from '@geist-ui/core/esm/text/text';
import { AssetPackTable } from '@VCRE/components/Table/AssetPackTable';
import { Texture, TextureFlag, TexturePack } from '@VCRE/core/gamedata';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { TextureViewer } from '../Texture/TextureViewer';

export interface TextureViewerProps {
    texturePack: TexturePack;
    textureId?: number;
}

type TextureFlagsViewerProps = {
    texture: Texture;
}

function TextureCanvas({ texture }: TextureFlagsViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        canvas.width = texture.info.width;
        canvas.height = texture.info.height;

        const imageData = new ImageData(texture.pixels, texture.info.width, texture.info.height);
        ctx.putImageData(imageData, 0, 0);
    }, [texture]);

    return <div className='canvas-wrapper'>
        <canvas ref={canvasRef} />
    </div>;
}

function TextureFlagsViewer({ texture }: TextureFlagsViewerProps) {
    const components = [];
    for (const flag of Object.values(TextureFlag)) {
        if (isNaN(Number(flag)) || !texture.info.hasFlag(flag as TextureFlag)) {
            continue;
        }

        if (components.length > 0) {
            components.push(<Spacer />);
        }
        components.push(<>
            <Tag scale={0.7}>
                {TextureFlag[flag as TextureFlag]}
            </Tag>
        </>);
    }

    return components;
}

export function TexturePackViewer({ texturePack, textureId }: TextureViewerProps) {
    const tableData = useMemo(() => {
        const data = [];
        for (const texture of texturePack.textures) {
            data.push({
                id: texture.id.toString(),
                offset: `0x${texture.offset.toString(16)}`,
                canvas: <TextureCanvas texture={texture} key={texture.id} />,
                width: texture.info.width,
                height: texture.info.height,
                paletteOffset: `0x${texture.info.paletteOffset.toString(16)}`,
                flags: <TextureFlagsViewer texture={texture} key={texture.id} />
            });
        }

        return data;
    }, [texturePack.textures]);

    const viewerProvider = useCallback(() => {
        if (textureId === undefined) {
            return;
        }

        const texture = texturePack.getTexture(textureId);
        if (!texture) {
            return;
        }

        return <TextureViewer texture={texture} />;
    }, [textureId, texturePack]);

    return <GridContainer gap={2}>
        <Grid xs={24} alignItems='center' direction='column'>
            <Text h3 margin={0}>{texturePack.name}</Text>
            <Text p small margin={0}>{texturePack.textures.length} texture(s)</Text>
        </Grid>
        <Grid xs={24}>
            <AssetPackTable data={tableData} previewColIndex={2} selectedRowId={textureId} modalViewerProvider={viewerProvider}>
                <TableColumn label='ID' prop='id' />
                <TableColumn label='Offset' prop='offset' />
                <TableColumn label='Preview' prop='canvas' className='table-preview-cell' />
                <TableColumn label='Width' prop='width' />
                <TableColumn label='Height' prop='height' />
                <TableColumn label='Palette offset' prop='paletteOffset' />
                <TableColumn label='Flags' prop='flags' />
            </AssetPackTable>
        </Grid>
    </GridContainer>;
}
