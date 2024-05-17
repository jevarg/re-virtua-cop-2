import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Model3DView } from '@VCRE/core/3d';
import { Model } from '@VCRE/core/gamedata';
import { useEffect, useRef } from 'react';

export type ModelViewerProps = {
    model: Model;
}

export function ModelViewer({ model }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !model) {
            return;
        }

        const engine = new Engine(canvasRef.current, false);
        const model3DView = new Model3DView(engine, {
            controllableCamera: true,
            highlightHoveredFace: true,
            logClickedFace: true,
            showFPSCounter: false
        });

        model3DView.setModel(model);
        engine.runRenderLoop(function () {
            model3DView.render();
        });

        return () => {
            model3DView.destroy();
            engine.dispose();
        };
    }, [model]);

    return <>
        <canvas className='model-viewer' ref={canvasRef} />
    </>;
}