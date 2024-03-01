import { useContext, useEffect, useMemo, useRef } from 'react';
import { ModelsFile } from '../../core/gamedata/Models/ModelsFile';
import { MainContext } from '../../contexts/MainContext';
import { AssetType } from '../../core/gamedata/PackedAssetsFile';
import { TextureFileName } from '../../core/gamedata/Textures/TexturesFile';
import { Rect } from '../../core/types/Rect';
import { MaterialFlag } from '../../core/gamedata/Models/Model';
import { Texture } from '../../core/gamedata/Textures/Texture';

import './ModelViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Vector3 } from '@babylonjs/core/Maths';

import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { GizmoManager } from '@babylonjs/core/Gizmos/gizmoManager';
// import { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import { GroundMesh } from '@babylonjs/core/Meshes/groundMesh';
import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import { MeshBuilder } from '@babylonjs/core';

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

        const engine = new Engine(canvasRef.current, true);
        const createScene = function () {
            const scene = new Scene(engine);
            scene.clearColor = Color3.Black().toColor4();

            const camera = new ArcRotateCamera('camera', -Math.PI / 3, Math.PI / 3, 5, new Vector3(0, 0, 0), scene);
            camera.minZ = 0;
            camera.wheelPrecision = 100;
            camera.attachControl(canvasRef.current, true);

            return scene;
        };

        const textureFile = mainCtx.gameData.assets?.[AssetType.Texture].get(TextureFileName.T_MINI_C);
        if (!textureFile || !textureFile.tileMap) {
            return;
        }

        const scene = createScene();
        const ground = MeshBuilder.CreateGround('ground', {
            width: 20,
            height: 20,
            updatable: false,
        }, scene);
        const gridMaterial = new GridMaterial('ground-material');
        gridMaterial.lineColor = Color3.Gray();
        ground.material = gridMaterial;

        const submeshes: Mesh[] = [];
        for (const [i, f] of model.faces.entries()) {
            if (!f.material.hasMaterialFlag(MaterialFlag.Enabled) ||
                !f.material.hasMaterialFlag(MaterialFlag.Texture)) {
                continue;
            }

            console.log(i, f.material)

            // let tile: Tile;
            let texture: Texture;
            try {
                // tile = textureFile.tileMap.getTile(f.material.textureId);
                texture = textureFile.getTexture(f.material.textureId - textureFile.offset);
            } catch (e) {
                console.warn(e);
                continue;
            }

            // const uvRect = new Rect(
            //     tile.rect.top / textureFile.tileMap.height,
            //     tile.rect.right / textureFile.tileMap.width,
            //     tile.rect.bottom / textureFile.tileMap.height,
            //     tile.rect.left / textureFile.tileMap.width,
            // );

            const uvRect = new Rect(0, 1, 1, 0);
            const positions = [
                model.vertices[f.v1],
                model.vertices[f.v2],
                model.vertices[f.v3],
                model.vertices[f.v4],
            ].flatMap(v => [v.x, v.y, v.z]);

            const uvs = Array<number>(8);
            if (f.material.hasMaterialFlag(MaterialFlag.InvertX)) {
                uvs[0] = uvRect.left;
                uvs[2] = uvRect.right;
                uvs[4] = uvRect.right;
                uvs[6] = uvRect.left;
            } else {
                uvs[0] = uvRect.right;
                uvs[2] = uvRect.left;
                uvs[4] = uvRect.left;
                uvs[6] = uvRect.right;
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

            if (texture.id === 75 || texture.id === 76) {
                console.log(i, texture, f);
            }

            const rawTexture = RawTexture.CreateRGBATexture(
                texture.pixels,
                texture.info.width,
                texture.info.height,
                scene,
                true,
                false,
                BabylonTexture.NEAREST_SAMPLINGMODE
            );

            const material = new StandardMaterial('material', scene);
            material.emissiveTexture = rawTexture;

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

        const finalMesh = Mesh.MergeMeshes(submeshes, true, undefined, undefined, undefined, true);
        if (!finalMesh) {
            console.warn('Final mesh could not be created');
            return;
        }

        finalMesh.enablePointerMoveEvents = true;

        // scene.onPointerDown = function (evt, pickInfo, type) {
        //     if (pickInfo.hit && pickInfo.subMeshId !== -1) {
        //         const face = model.faces[pickInfo.subMeshId];
        //         console.log(face);
        //     }
        // };

        let prevPickedMeshId: number | undefined;
        // TODO: refactor
        scene.onPointerMove = function (_, pickInfo) {
            if (pickInfo.hit && pickInfo.subMeshId !== -1 && pickInfo.pickedMesh) {
                if (prevPickedMeshId !== undefined) {
                    if (prevPickedMeshId === pickInfo.subMeshId) {
                        return;
                    }

                    const prevMesh = finalMesh.subMeshes[prevPickedMeshId];
                    const material = prevMesh.getMaterial() as StandardMaterial;
                    material.emissiveColor = Color3.Black();
                }

                const subMesh = finalMesh.subMeshes[pickInfo.subMeshId];
                const material = subMesh.getMaterial() as StandardMaterial;

                material.emissiveColor = new Color3(0.3, 0.3, 0.3);
                prevPickedMeshId = pickInfo.subMeshId;
            } else if (!pickInfo.hit && prevPickedMeshId !== undefined) {
                const prevMesh = finalMesh.subMeshes[prevPickedMeshId];
                const material = prevMesh.getMaterial() as StandardMaterial;

                material.emissiveColor = Color3.Black();
                prevPickedMeshId = undefined;
            }
        };

        const gizmoManager = new GizmoManager(scene);
        gizmoManager.positionGizmoEnabled = true;
        gizmoManager.attachToMesh(finalMesh);

        // Temp
        (scene.cameras[0] as ArcRotateCamera).setTarget(finalMesh.getBoundingInfo().boundingBox.centerWorld);

        engine.runRenderLoop(function () {
            scene.render();
        });

        showFpsCounter(scene);

        return () => {
            // rawTexture.dispose();
            scene.dispose();
            engine.dispose();
        };
    }, [mainCtx.gameData.assets, model]);

    return <>
        <canvas className='model-viewer' ref={canvasRef} />
    </>;
}