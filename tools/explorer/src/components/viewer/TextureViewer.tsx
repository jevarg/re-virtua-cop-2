import { useEffect, useRef } from 'react';
import { Texture } from '../../core/gamedata/Textures/Texture';

export interface TextureViewerProps {
    texture: Texture
}

export function TextureViewer({ texture }: TextureViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
            return;
        }

        canvasRef.current!.width = texture.info.width;
        canvasRef.current!.height = texture.info.height;

        const imageData = new ImageData(texture.pixels, texture.info.width, texture.info.height);
        ctx.putImageData(imageData, 0, 0);
    }, [texture]);

    return (
        <canvas ref={canvasRef} />
    );
}