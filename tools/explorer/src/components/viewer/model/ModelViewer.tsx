import { useEffect, useMemo, useRef } from 'react';
import { ModelPack } from '../../../core/gamedata/Models/ModelPack';

import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Model3DView } from './Model3DView';

export type ModelViewerProps = {
    models: ModelPack;
}

export function ModelViewer({ models }: ModelViewerProps) {
    // const gameData = GameData.get();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const model = useMemo(() => {
        return models.getModel(25);
    }, [models]);

    useEffect(() => {
        if (!canvasRef.current || !model) {
            return;
        }

        const engine = new Engine(canvasRef.current, false);
        const model3DView = new Model3DView(engine, canvasRef.current);
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