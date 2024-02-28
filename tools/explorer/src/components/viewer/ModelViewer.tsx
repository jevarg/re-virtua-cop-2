import { useContext, useEffect, useMemo, useRef } from 'react';
import { ModelsFile } from '../../core/gamedata/Models/ModelsFile';
import { MainContext } from '../../contexts/MainContext';
import { AssetType } from '../../core/gamedata/PackedAssetsFile';
import { TextureFileName } from '../../core/gamedata/Textures/TexturesFile';
import { Rect } from '../../core/types/Rect';

import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Vector3 } from '@babylonjs/core/Maths';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { GizmoManager } from '@babylonjs/core/Gizmos/gizmoManager';
import { Tile } from '../../core/gamedata/Textures/TileMap';
import { MaterialFlag } from '../../core/gamedata/Models/Model';

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
        return models.getModel(25);
    }, [models]);

    useEffect(() => {
        if (!canvasRef.current || !model) {
            return;
        }

        const engine = new Engine(canvasRef.current, true);
        const createScene = function () {
            const scene = new Scene(engine);
            scene.clearColor = Color3.Black().toColor4();

            const camera = new ArcRotateCamera('camera', 0.1, 1.4, 0.5, new Vector3(0, 0, 0), scene);
            camera.minZ = 0;
            camera.wheelPrecision = 100;
            camera.attachControl(canvasRef.current, true);

            return scene;
        };

        const textureFile = mainCtx.gameData.assets?.[AssetType.Texture].get(TextureFileName.T_COMMON);
        if (!textureFile || !textureFile.tileMap) {
            return;
        }

        const scene = createScene();
        const rawTexture = RawTexture.CreateRGBATexture(
            textureFile.tileMap.pixels,
            textureFile.tileMap.width,
            textureFile.tileMap.height,
            scene,
            true,
            false,
            Texture.NEAREST_SAMPLINGMODE
        );
        rawTexture.hasAlpha = true;

        const material = new StandardMaterial('material', scene);
        material.emissiveTexture = rawTexture;

        const submeshes: Mesh[] = [];
        for (const [i, f] of model.faces.entries()) {
            if (!f.material.hasMaterialFlag(MaterialFlag.Enabled)) {
                continue;
            }

            let tile: Tile;
            try {
                tile = textureFile.tileMap.getTile(f.material.textureId);
            } catch (e) {
                console.warn(e);
                continue;
            }

            const uvRect = new Rect(
                tile.rect.top / textureFile.tileMap.height,
                tile.rect.right / textureFile.tileMap.width,
                tile.rect.bottom / textureFile.tileMap.height,
                tile.rect.left / textureFile.tileMap.width,
            );

            const positions = [
                model.vertices[f.v1],
                model.vertices[f.v2],
                model.vertices[f.v3],
                model.vertices[f.v4],
            ].flatMap(v => [v.x, v.y, v.z]);

            const uvs = Array<number>(8);
            if (f.material.hasMaterialFlag(MaterialFlag.InvertX)) {
                uvs[0] = uvRect.right;
                uvs[2] = uvRect.left;
                uvs[4] = uvRect.left;
                uvs[6] = uvRect.right;
            } else {
                uvs[0] = uvRect.left;
                uvs[2] = uvRect.right;
                uvs[4] = uvRect.right;
                uvs[6] = uvRect.left;
            }

            if (f.material.hasMaterialFlag(MaterialFlag.InvertY)) {
                uvs[1] = uvRect.bottom;
                uvs[3] = uvRect.bottom;
                uvs[5] = uvRect.top;
                uvs[7] = uvRect.top;
            } else {
                uvs[1] = uvRect.top;
                uvs[3] = uvRect.top;
                uvs[5] = uvRect.bottom;
                uvs[7] = uvRect.bottom;
            }

            const mesh = new Mesh(i.toString(), scene);
            mesh.material = material;

            const vertexData = new VertexData();
            vertexData.positions = positions;
            vertexData.uvs = uvs;
            vertexData.indices = [
                0, 2, 1,
                0, 3, 2,
            ];

            vertexData.applyToMesh(mesh);
            submeshes.push(mesh);
        }

        const finalMesh = Mesh.MergeMeshes(submeshes);
        if (!finalMesh) {
            console.warn('Final mesh could not be created');
            return;
        }

        finalMesh.rotate(new Vector3(-1, 0, 0), Math.PI / 2);

        const gizmoManager = new GizmoManager(scene);
        // gizmoManager.positionGizmoEnabled = true;
        gizmoManager.attachToMesh(finalMesh);

        // Temp
        (scene.cameras[0] as ArcRotateCamera).setTarget(finalMesh.getBoundingInfo().boundingBox.centerWorld);

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

    return <>
        <canvas className='model-viewer' ref={canvasRef} />
    </>;
}