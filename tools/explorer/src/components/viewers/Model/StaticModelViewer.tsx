import { Engine } from '@babylonjs/core';
import { Loading } from '@geist-ui/core';
import { isElementInViewport } from '@VCRE/components/utils';
import { Model3DView } from '@VCRE/core/3d';
import { Model } from '@VCRE/core/gamedata';
import { useCallback, useEffect, useRef, useState } from 'react';

export type StaticModelViewerProps = {
    engine: Engine;
    model: Model;
};

export function StaticModelViewer({ engine, model }: StaticModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // This component will only load the model if it is visible by the user
    const onVisibilityChanged = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }

        const isViewport = isElementInViewport(canvasRef.current);
        setIsVisible(isViewport);
    }, [canvasRef]);

    useEffect(() => {
        onVisibilityChanged();
        window.addEventListener('scroll', onVisibilityChanged);

        return () => {
            window.removeEventListener('scroll', onVisibilityChanged);
        };
    }, [onVisibilityChanged]);

    useEffect(() => {
        if (!canvasRef || isLoaded || !isVisible) {
            return;
        }

        console.debug(`Loading: model ${model.id}`);
        const view = new Model3DView(engine, {
            controllableCamera: false,
            highlightHoveredFace: false,
            logClickedFace: false,
            showFPSCounter: false
        });

        view.setModel(model);

        // We just render 1 frame and get the hell out
        view.render();

        // Seems buggy, will leave it like this for now.
        // view.destroy();

        const engineCanvas = engine.getRenderingCanvas();
        if (!engineCanvas) {
            console.warn('Could not get engine canvas!');
            return;
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
            console.warn('Could not get static view canvas context!');
            return;
        }

        ctx.drawImage(engineCanvas, 0, 0);
        setIsLoaded(true);
    }, [engine, canvasRef, isLoaded, isVisible, model]);

    useEffect(() => {
        setIsLoaded(false);
    }, [model]);

    return <>
        { !isLoaded && <div className='model-static-viewer-loader'>
            <Loading />
        </div> }
        <div style={{visibility: isLoaded ? 'visible' : 'hidden'}} className='model-static-viewer'>
            <canvas width={128} height={128} ref={canvasRef} />
        </div>
    </>;
}