import { useCallback, useEffect, useRef, useState } from 'react';
import './TextureViewer.css';
import Konva from 'konva';
import { TexturePackName, TexturePack } from '../../core/gamedata/Textures/TexturePack';
import { Tile } from '../../core/gamedata/Textures/TileMap';
import { Card, Grid } from '@geist-ui/core';
import { TileViewer } from './TileViewer';

export interface TextureViewerProps {
    textureFile: TexturePack;
}

type TileClickedFunction = (tile: Tile) => void;

function buildTileMap(textureFile: TexturePack, layer: Konva.Layer, onTileClicked: TileClickedFunction) {
    if (!textureFile.tileMap) {
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

    for (const tile of textureFile.tileMap) {
        const texture = textureFile.textures[tile.textureId];

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
                onTileClicked(tile);
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

export function TextureViewer({ textureFile }: TextureViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedTile, setSelectedTile] = useState<Tile>();

    const onTileClicked = useCallback<TileClickedFunction>(tile => {
        setSelectedTile(tile);
    }, []);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const stage = createStage(containerRef.current);
        const onWindowResized = () => updateLayout(stage);
        const layer = new Konva.Layer({
            imageSmoothingEnabled: false
        });

        stage.add(layer);
        buildTileMap(textureFile, layer, onTileClicked);

        window.addEventListener('resize', onWindowResized);
        return () => {
            window.removeEventListener('resize', onWindowResized);
        };
    }, [onTileClicked, textureFile]);

    return <Grid.Container gap={8}>
        <Grid xs={17}>
            <Card width="100%">
                <div className='tilemap-container' ref={containerRef} ></div>
            </Card>
        </Grid>
        <Grid xs={7} width="100%">
            <TileViewer textureFileName={textureFile.name as TexturePackName} tile={selectedTile} />
        </Grid>
    </Grid.Container>;
}
