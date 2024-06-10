import './TextureViewer.css';

import { Texture } from '@VCRE/core/gamedata';
import Konva from 'konva';
import { useEffect, useRef } from 'react';

export type TextureViewerProps = {
    texture: Texture;
}

function createStage(container: HTMLDivElement) {
    const stage = new Konva.Stage({
        container,
        width: container.clientWidth,
        height: container.clientHeight,
        draggable: true,
        scale: { x: 1, y: 1 },
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

function createLayer(texture: Texture) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Cannot get context...');
        return;
    }

    canvas.width = texture.info.width;
    canvas.height = texture.info.height;

    const imageData = new ImageData(texture.pixels, texture.info.width, texture.info.height);
    ctx.putImageData(imageData, 0, 0);

    const layer = new Konva.Layer({
        imageSmoothingEnabled: false
    });
    Konva.Image.fromURL(canvas.toDataURL(), function(image) {
        layer.add(image);
        image.setPosition({
            x: (layer.width() - image.width()) / 2,
            y: (layer.height() - image.height()) / 2,
        });
    });

    return layer;
}

export function TextureViewer({ texture }: TextureViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        // TODO: Create stage only once when loaded (maybe as a prop?)
        const stage = createStage(container);
        const layer = createLayer(texture);
        if (!layer) {
            return;
        }

        stage.add(layer);
        // layer.
    }, [texture]);

    return <div ref={containerRef} className='texture-viewer-container' />;
}