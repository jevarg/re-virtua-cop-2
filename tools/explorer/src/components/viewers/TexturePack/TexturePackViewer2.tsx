import './TexturePackViewer.css';

import Card from '@geist-ui/core/esm/card/card';
import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Table from '@geist-ui/core/esm/table';
import { Texture, TexturePack, Tile } from '@VCRE/core/gamedata';
import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TextureInfo } from './TextureInfo';

export interface TextureViewerProps {
    texturePack: TexturePack;
    textureId?: number;
}

type TileClickedFunction = (texture: Texture) => void;

function buildTileMap(texturePack: TexturePack, layer: Konva.Layer, onTileClicked: TileClickedFunction) {
    if (!texturePack.tileMap) {
        console.warn('tileMap is not set!');
        return;
    }

    const group = new Konva.Group();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Cannot get context...');
        return;
    }

    const rect = new Konva.Rect({
        stroke: '#ff00007c',
        strokeScaleEnabled: true,
        listening: false,
    });

    for (const tile of texturePack.tileMap) {
        const texture = texturePack.textures[tile.textureId];

        canvas.width = texture.info.width;
        canvas.height = texture.info.height;

        const imageData = new ImageData(texture.pixels, texture.info.width, texture.info.height);
        ctx.putImageData(imageData, 0, 0);

        Konva.Image.fromURL(canvas.toDataURL(), function(image) {
            image.setAttrs({
                x: tile.rect.left,
                y: tile.rect.top,
            });

            image.on('mouseover', function () {
                rect.setAttrs({
                    visible: true,
                    x: tile.rect.left - 1,
                    y: tile.rect.top - 1,
                    width: tile.rect.width + 2,
                    height: tile.rect.height + 2,
                });
            });

            image.on('mouseout', function () {
                rect.visible(false);
            });

            image.on('click', function () {
                onTileClicked(texture);
            });

            group.add(image);
        });
    }

    layer.add(group);
    layer.add(rect);
}

function createStage(container: HTMLDivElement) {
    const stage = new Konva.Stage({
        container,
        width: container.clientWidth,
        height: container.clientHeight,
        draggable: true,
        scale: { x: 3, y: 3 },
    });

    stage.on('wheel', (e) => {
        e.evt.preventDefault();

        if (!e.evt.deltaY) {
            return;
        }

        const scale = stage.scale() || { x: 1, y: 1 };
        const pointer = stage.getPointerPosition()!;
        const mousePos = {
            x: (pointer.x - stage.x()) / scale.x,
            y: (pointer.y - stage.y()) / scale.y,
        };

        if (e.evt.deltaY > 0) {
            scale.x = Math.max(0.5, scale.x - 0.5);
            scale.y = Math.max(0.5, scale.y - 0.5);
        } else {
            scale.x = Math.max(0.5, scale.x + 0.5);
            scale.y = Math.max(0.5, scale.y + 0.5);
        }

        stage.scale(scale);
        stage.position({
            x: pointer.x - mousePos.x * scale.x,
            y: pointer.y - mousePos.y * scale.y
        });
    });

    return stage;
}

function updateLayout(stage: Konva.Stage) {
    const container = stage.container();

    stage.size({
        width: container.clientWidth,
        height: container.clientHeight
    });
}

export function TextureViewer({ texturePack, textureId }: TextureViewerProps) {
    const tableData = useMemo(() => {
        const data = [];
        for (const texture of texturePack.textures) {
            data.push({
                id: texture.id,
                width: texture.info.width,
                height: texture.info.height,
                paletteOffset: texture.info.paletteOffset
            });
        }
    }, []);

    return <GridContainer gap={8}>
        <Grid xs={17}>
            <Card width="100%">
                <Table>

                </Table>
            </Card>
        </Grid>
        <Grid xs={7} width="100%">
            <TextureInfo texture={undefined} />
        </Grid>
    </GridContainer>;
}
