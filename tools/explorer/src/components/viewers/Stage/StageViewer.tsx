import './StageViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Stage3DView } from '@VCRE/core/3d';
import { ModelPack } from '@VCRE/core/gamedata';
import { useEffect, useRef } from 'react';

export type StageViewerProps = {
    modelPack: ModelPack;
}

export function StageViewer({ modelPack }: StageViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !modelPack) {
            return;
        }

        const engine = new Engine(canvasRef.current, false);
        const stageViewer = new Stage3DView(engine, canvasRef.current);
        stageViewer.camera.position.fromArray(JSON.parse(sessionStorage.getItem('camPos') || '[0, 0, 0]'));
        stageViewer.camera.rotation.fromArray(JSON.parse(sessionStorage.getItem('camRot') || '[0, 0, 0]'));

        stageViewer.loadStage(modelPack);
        // stageViewer.loadStage(modelPack, 289, 290);
        // stageViewer.loadStage(modelPack, 291, 292);
        console.info(`Active textures: ${stageViewer.scene.textures.length}`);


        engine.runRenderLoop(function () {
            stageViewer.scene.render();
        });

        const intervalId = setInterval(() => {
            sessionStorage.setItem('camPos', JSON.stringify(stageViewer.camera.position.asArray()));
            sessionStorage.setItem('camRot', JSON.stringify(stageViewer.camera.rotation.asArray()));
        }, 1000);

        return () => {
            clearInterval(intervalId);
            // stageViewer
            // model3DView.destroy();
            engine.dispose();

        };
    }, [modelPack]);

    return <>
        <canvas className='stage-viewer' ref={canvasRef} onClick={(e) => {
            e.currentTarget.requestPointerLock();
        }}/>
    </>;
}