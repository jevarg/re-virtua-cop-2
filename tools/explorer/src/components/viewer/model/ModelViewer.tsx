import { useCallback, useEffect, useRef, useState } from 'react';
import { ModelPack } from '../../../core/gamedata/Models/ModelPack';

import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Model3DView } from './Model3DView';
import Input from '@geist-ui/core/esm/input/input';
import { Model } from '../../../core/gamedata/Models/Model';
import { Button } from '@geist-ui/core';

export type ModelViewerProps = {
    models: ModelPack;
}

let intervalId: number | undefined;

export function ModelViewer({ models }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<Model>();
    const [modelId, setModelId] = useState<number>();

    const changeModel = useCallback(() => {
        if (modelId === undefined) {
            return;
        }

        setModel(models.getModel(modelId));
    }, [modelId, models]);

    useEffect(() => {
        if (!canvasRef.current || !model) {
            return;
        }

        const engine = new Engine(canvasRef.current, false);
        const model3DView = new Model3DView(engine, canvasRef.current);
        model3DView.setModel(model);

        model3DView.camera.alpha = Number(sessionStorage.getItem('camAlpha') || '0');
        model3DView.camera.beta = Number(sessionStorage.getItem('camBeta') || '0');
        model3DView.camera.radius = Number(sessionStorage.getItem('camRadius') || '5');

        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(() => {
            sessionStorage.setItem('camAlpha', model3DView.camera.alpha.toString());
            sessionStorage.setItem('camBeta', model3DView.camera.beta.toString());
            sessionStorage.setItem('camRadius', model3DView.camera.radius.toString());
        }, 1000);

        engine.runRenderLoop(function () {
            model3DView.render();
        });

        return () => {
            model3DView.destroy();
            engine.dispose();
            clearInterval(intervalId);
        };
    }, [model]);

    return <>
        <Input htmlType='number' placeholder='Model id' onChange={(e) => setModelId(e.target.valueAsNumber)} crossOrigin={undefined}></Input>
        &nbsp;
        <Button onClick={changeModel} disabled={modelId === undefined} scale={0.8} placeholder={undefined} auto>Ok</Button>
        <canvas className='model-viewer' ref={canvasRef} />
    </>;
}