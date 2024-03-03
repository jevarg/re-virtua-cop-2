import { Face, Model } from '../../../core/gamedata/Models/Model';
import { ModelMeshBuilder } from './ModelMeshBuilder';

import { Scene } from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Color3, Vector3 } from '@babylonjs/core/Maths';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { IPointerEvent } from '@babylonjs/core/Events/deviceInputEvents';
import { PickingInfo } from '@babylonjs/core/Collisions/pickingInfo';
import { HemisphericLight, MeshBuilder, StandardMaterial } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid/gridMaterial';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';

export type FaceClickedFunction = (face: Face) => void;

export class Model3DView {
    public static readonly cameraName = 'mainCamera';

    public readonly engine: Engine;
    public readonly scene: Scene;
    public readonly camera: ArcRotateCamera;
    public onFaceClicked?: FaceClickedFunction;

    private _model?: Model;
    private _modelMesh?: Mesh;
    private _highlightedSubMeshId?: number;

    private _fpsCounterIntervalId?: number;

    constructor(engine: Engine, canvas: HTMLCanvasElement) {
        this.engine = engine;

        this.scene = new Scene(engine);
        this.scene.clearColor = Color3.Black().toColor4(1);
        this.scene.onPointerMove = this._onPointerMove.bind(this);
        this.scene.onPointerDown = this._onPointerDown.bind(this);

        // var light = new HemisphericLight("light", new Vector3(1, 1, 1), this.scene);
        // this.scene.reflec

        this.camera = new ArcRotateCamera(
            Model3DView.cameraName,
            -Math.PI / 3,
            Math.PI / 3,
            5,
            new Vector3(0, 0, 0),
            this.scene
        );
        this.camera.minZ = 0;
        this.camera.wheelPrecision = 100;
        this.camera.attachControl(canvas, true);

        const gridMaterial = new GridMaterial('ground-material');
        gridMaterial.lineColor = Color3.Gray();

        const ground = MeshBuilder.CreateGround('ground', {
            width: 20,
            height: 20,
            updatable: false,
        }, this.scene);
        ground.isPickable = false;
        ground.isVisible = false;
        ground.material = gridMaterial;

        this._setupFPSCounter();
    }

    public destroy() {
        if (this._fpsCounterIntervalId) {
            clearInterval(this._fpsCounterIntervalId);
        }

        this._modelMesh?.dispose();
        this.camera.dispose()
        this.scene.dispose();
    }

    private _setupFPSCounter() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
        const textBlock = new TextBlock();
        textBlock.resizeToFit = true;
        textBlock.color = '#888';
        textBlock.fontSize = 16;
        textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(textBlock);

        this._fpsCounterIntervalId = setInterval(() => {
            textBlock.text = this.engine.getFps().toFixed(0);
        }, 500);
    }

    private _toggleFaceHighlight(subMeshId: number) {
        const subMesh = this._modelMesh?.subMeshes[subMeshId];
        if (!subMesh) {
            return;
        }

        const material = subMesh.getMaterial() as StandardMaterial;
        if (material.emissiveColor.r === 0) {
            material.emissiveColor = new Color3(0.3, 0.3, 0.3);
        } else {
            material.emissiveColor = Color3.BlackReadOnly;
        }
    }

    private _onPointerDown(_e: IPointerEvent, pickInfo: PickingInfo) {
        if (!this._model) {
            return;
        }

        if (pickInfo.hit && pickInfo.subMeshId !== -1) {
            const face = this._model?.faces[pickInfo.subMeshId];
            console.log(face);
            if (!face) {
                return;
            }

            this.onFaceClicked?.(face);
        }
    }

    private _onPointerMove(_e: IPointerEvent, pickInfo: PickingInfo) {
        if (pickInfo.subMeshId === this._highlightedSubMeshId) {
            return;
        }

        if (pickInfo.hit) {
            if (this._highlightedSubMeshId !== undefined) {
                this._toggleFaceHighlight(this._highlightedSubMeshId);
            }

            this._toggleFaceHighlight(pickInfo.subMeshId);
            this._highlightedSubMeshId = pickInfo.subMeshId;
        } else if (this._highlightedSubMeshId) {
            this._toggleFaceHighlight(this._highlightedSubMeshId);
            this._highlightedSubMeshId = undefined;
        }
    }

    public setModel(model: Model) {
        this._modelMesh = ModelMeshBuilder.CreateMesh(model, this.scene);
        this._modelMesh.enablePointerMoveEvents = true;
        this._model = model;

        this.center();
    }

    public center() {
        const pos = this._modelMesh?.getBoundingInfo().boundingBox.centerWorld;
        this.camera.setTarget(pos || Vector3.Zero());
        this.camera.radius = 5;
    }

    public render() {
        this.scene.render();
    }
}