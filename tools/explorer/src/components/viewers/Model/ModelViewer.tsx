import './ModelViewer.css';

import { Scene } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { GLTF2Export } from '@babylonjs/serializers';
import { ButtonDropdown, ButtonDropdownItemProps, Spacer, useToasts } from '@geist-ui/core';
import Download from '@geist-ui/icons/download';
import { Button } from '@VCRE/components/GeistFix';
import { Model3DView } from '@VCRE/core/3d';
import { Model } from '@VCRE/core/gamedata';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

export type ModelViewerProps = {
    model: Model;
}

type DownloadButtonItemProps = {
    format: string;
};

function DownloadFormat({ format } : DownloadButtonItemProps) {
    return <>
        <Download size={16} /><Spacer width={0.5} />{format}
    </>;
}

export function ModelViewer({ model }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setToast } = useToasts();
    const scene = useRef<Scene>();

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

        scene.current = model3DView.scene;

        model3DView.setModel(model);
        engine.runRenderLoop(function () {
            model3DView.render();
        });

        return () => {
            scene.current = undefined;
            model3DView.destroy();
            engine.dispose();
        };
    }, [model]);

    const download = useCallback(async (format: string) => {
        if (!scene.current) {
            setToast({ text: 'Could not download model', type: 'error' });
            return;
        }

        let promise;
        const filePrefix = `vc2-${model.parent.name.replace('.BIN', '')}-${model.id}`;
        switch (format.toLowerCase()) {
            case 'glb':
                promise = GLTF2Export.GLBAsync(scene.current, filePrefix);
                break;

            case 'gltf':
                promise = GLTF2Export.GLTFAsync(scene.current, filePrefix);
                break;

            default:
                setToast({ text: 'Unsupported format', type: 'warning' });
                return;
        }

        setToast({ text: 'Preparing model' });
        (await promise).downloadFiles();
    }, [model, setToast]);

    return <>
        <div className='model-viewer'>

            <ButtonDropdown className='download-button' scale={2 / 3} auto>
                <ButtonDropdown.Item main onClick={() => download('GLB')}>
                    <Download size={16} />
                    <Spacer width={0.5} />
                    GLB
                </ButtonDropdown.Item>
                <ButtonDropdown.Item onClick={() => download('glTF')}>glTF</ButtonDropdown.Item>
                <ButtonDropdown.Item onClick={() => download('OBJ')}>OBJ</ButtonDropdown.Item>
            </ButtonDropdown>

            <canvas ref={canvasRef} />
        </div>
    </>;
}