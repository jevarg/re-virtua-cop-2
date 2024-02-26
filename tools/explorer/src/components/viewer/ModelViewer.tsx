import { useContext, useEffect, useMemo, useRef } from 'react';
import { ModelsFile } from '../../core/gamedata/Models/ModelsFile';
import { MainContext } from '../../contexts/MainContext';
import { AssetType } from '../../core/gamedata/PackedAssetsFile';
import { TextureFileName } from '../../core/gamedata/Textures/TexturesFile';

import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Vector3 } from '@babylonjs/core/Maths';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { CameraGizmo } from '@babylonjs/core/Gizmos/cameraGizmo';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { Rect } from '../../core/types/Rect';

export type ModelViewerProps = {
    models: ModelsFile;
}

function showFpsCounter(scene: Scene) {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const textBlock = new TextBlock();
    textBlock.resizeToFit = true;
    textBlock.color = '#888';
    textBlock.fontSize = 16;
    textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(textBlock);

    setInterval(() => {
        textBlock.text = scene.getEngine().getFps().toFixed(0);
    }, 500);
}

export function ModelViewer({ models }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mainCtx = useContext(MainContext);
    const model = useMemo(() => {
        return models.getModel(71);
    }, [models]);

    useEffect(() => {
        if (!canvasRef.current || !model) {
            return;
        }

        const engine = new Engine(canvasRef.current, true); // Generate the BABYLON 3D engine
        const createScene = function () {
            // This creates a basic Babylon Scene object (non-mesh)
            const scene = new Scene(engine);
            scene.clearColor = Color3.Black().toColor4();
            // This creates and positions a free camera (non-mesh)
            const camera = new ArcRotateCamera('camera', -1, 1, 5, new Vector3(0, 1, 0), scene);
            // This attaches the camera to the canvas
            camera.attachControl(canvasRef.current, true);
            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            // const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
            // Default intensity is 1. Let's dim the light a small amount
            // light.intensity = 1;
            // Our built-in 'ground' shape.
            // const ground = CreateGround("ground", {width: 6, height: 6}, scene);

            return scene;
        };

        const textureFile = mainCtx.gameData.assets?.[AssetType.Texture].get(TextureFileName.T_MINI_C);
        if (!textureFile || !textureFile.tileMap) {
            return;
        }

        const indices: number[] = [];
        const uvs: number[] = [0, 0, 1, 1];
        for (const f of model.faces) {
            const tile = textureFile.tileMap.getTile(f.material.textureId - textureFile.offset);

            // const minX = tile.rect.left / textureFile.tileMap.width;
            // const maxX = tile.rect.right / textureFile.tileMap.width;
            // const minY = tile.rect.top / textureFile.tileMap.height;
            // const maxY = tile.rect.bottom / textureFile.tileMap.height;

            const uvRect = new Rect(
                (textureFile.tileMap.height - tile.rect.top) / textureFile.tileMap.height,
                tile.rect.right / textureFile.tileMap.width,
                (textureFile.tileMap.height - tile.rect.bottom) / textureFile.tileMap.height,
                tile.rect.left / textureFile.tileMap.width,
            );

            console.log(`${tile.textureId}:`, tile.rect, uvRect);

            indices.push(
                f.v2, f.v1, f.v3,
                f.v4, f.v1, f.v3
            );

            uvs.push(
                uvRect.left, uvRect.top,
                uvRect.left, uvRect.top,
                uvRect.left, uvRect.top,

                uvRect.left, uvRect.top,
                uvRect.left, uvRect.top,
                uvRect.left, uvRect.top,
            );
        }


        const scene = createScene();
        const mesh = new Mesh(model.id.toString(), scene);
        const rawTexture = RawTexture.CreateRGBATexture(textureFile.tileMap.pixels, textureFile.tileMap.width, textureFile.tileMap.height, scene);
        rawTexture.hasAlpha = true;

        const material = new StandardMaterial('material', scene);
        material.emissiveTexture = rawTexture;

        mesh.material = material;

        const vertexData = new VertexData();
        vertexData.positions = model.vertices.flatMap(v => [v.x, v.y, v.z]);
        vertexData.indices = indices;
        vertexData.uvs = uvs;

        vertexData.applyToMesh(mesh);

        engine.runRenderLoop(function () {
            scene.render();
        });

        showFpsCounter(scene);

        return () => {
            rawTexture.dispose();
            scene.dispose();
            engine.dispose();
        };
    }, [mainCtx.gameData.assets, model]);

    return (
        <canvas className='model-viewer' ref={canvasRef} />
    );
}