import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { GLTF2Export } from '@babylonjs/serializers/glTF';
import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import useToasts from '@geist-ui/core/esm/use-toasts/use-toast';
import { Model3DView } from '@VCRE/core/3d';
import { Model } from '@VCRE/core/gamedata';
import { useCallback, useEffect, useRef } from 'react';

import { BackfaceCullingAction } from './actions/BackfaceCullingAction';
import { CenterAction } from './actions/CenterAction';
import { ExportModelAction } from './actions/ExportModelAction';
import { ExportModelSupportedFormats } from './actions/ExportModelSupportedFormats';

export type ModelViewerProps = {
    model: Model;
}

export function ModelViewer({ model }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewRef = useRef<Model3DView>();
    const { setToast } = useToasts();

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

        viewRef.current = model3DView;

        model3DView.setModel(model);
        engine.runRenderLoop(function () {
            model3DView.render();
        });

        return () => {
            viewRef.current = undefined;
            model3DView.destroy();
            engine.dispose();
        };
    }, [model]);

    const exportModel = useCallback(async (format: ExportModelSupportedFormats) => {
        if (!viewRef.current) {
            setToast({ text: 'Could not download model', type: 'error' });
            return;
        }

        let promise;
        const filePrefix = `vc2-${model.parent.name.replace('.BIN', '')}-${model.id}`;
        switch (format) {
            case ExportModelSupportedFormats.GLB:
                promise = GLTF2Export.GLBAsync(viewRef.current.scene, filePrefix);
                break;

            case ExportModelSupportedFormats.GLTF:
                promise = GLTF2Export.GLTFAsync(viewRef.current.scene, filePrefix);
                break;

            default:
                setToast({ text: 'Unsupported format', type: 'warning' });
                return;
        }

        setToast({ text: 'Preparing model' });
        (await promise).downloadFiles();
    }, [model, setToast]);

    const setBackfaceCulling = useCallback((enabled: boolean) => {
        if (!viewRef.current) {
            return;
        }

        viewRef.current.backfaceCulling = enabled;
    }, []);

    return <>
        <div className='model-viewer'>
            <GridContainer className='viewer-actions' margin={0.5}>
                <Grid alignContent='center'>
                    <CenterAction onClick={() => viewRef.current?.center()} />
                </Grid>
                <Grid alignContent='center'>
                    <BackfaceCullingAction onToggle={setBackfaceCulling} />
                </Grid>
                <Grid>
                    <ExportModelAction onExport={exportModel} />
                </Grid>
            </GridContainer>

            <canvas ref={canvasRef} />
        </div>
    </>;
}