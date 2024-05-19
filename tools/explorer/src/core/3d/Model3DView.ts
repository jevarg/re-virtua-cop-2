import { HighlightLayer, Nullable, StandardMaterial } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PickingInfo } from '@babylonjs/core/Collisions/pickingInfo';
import { Engine } from '@babylonjs/core/Engines/engine';
import { IPointerEvent } from '@babylonjs/core/Events/deviceInputEvents';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Face, Model } from '@VCRE/core/gamedata';

import { ModelMeshBuilder } from './ModelMeshBuilder';

export type FaceClickedFunction = (face: Face) => void;

export type ViewOptions = {
    showFPSCounter: boolean;
    controllableCamera: boolean;
    highlightHoveredFace: boolean;
    logClickedFace: boolean;
};

const defaultViewOptions: ViewOptions = {
    showFPSCounter: false,
    controllableCamera: true,
    highlightHoveredFace: false,
    logClickedFace: false
};

type HighlightedSubMesh = {
    subMeshId: number,
    originalColor: Color3,
};

export class Model3DView {
    public static readonly cameraName = 'mainCamera';

    public readonly engine: Engine;
    public readonly scene: Scene;
    public readonly camera: ArcRotateCamera;
    public onFaceClicked?: FaceClickedFunction;

    private _model?: Model;
    private _modelMesh?: Mesh;
    private _highlightedSubMesh?: HighlightedSubMesh;

    private _fpsCounterIntervalId?: number;
    private _options: ViewOptions;

    constructor(engine: Engine, options: ViewOptions = defaultViewOptions) {
        this._options = options;
        this.engine = engine;

        this.scene = new Scene(engine);
        this.scene.clearColor = new Color4(0.12, 0.12, 0.12, 1);

        if (this._options.highlightHoveredFace) {
            this.scene.onPointerMove = this._onPointerMove.bind(this);
        }

        if (this._options.logClickedFace) {
            this.scene.onPointerUp = this._onPointerUp.bind(this);
        }

        this.camera = new ArcRotateCamera(
            Model3DView.cameraName,
            Math.PI / 1.2,
            Math.PI / 2.5,
            5,
            new Vector3(0, 0, 0),
            this.scene
        );

        this.camera.minZ = 0;
        if (this._options.controllableCamera) {
            this.camera.wheelPrecision = 100;
            this.camera.attachControl(undefined, false);
            this.scene.attachControl(true, true, true);
        }

        if (this._options.showFPSCounter) {
            this._setupFPSCounter();
        }
    }

    public destroy() {
        if (this._fpsCounterIntervalId !== undefined) {
            clearInterval(this._fpsCounterIntervalId);
        }

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

    private _toggleFaceHighlight(subMeshId: number, color: Color3) {
        const subMesh = this._modelMesh?.subMeshes[subMeshId];
        if (!subMesh) {
            return;
        }

        const material = subMesh.getMaterial() as StandardMaterial;
        const prevColor = material.emissiveColor;
        material.emissiveColor = color;

        return prevColor;
    }

    private _onPointerUp(_e: IPointerEvent, pickInfo: Nullable<PickingInfo>) {
        if (!this._model || !pickInfo?.hit || pickInfo.subMeshId === -1) {
            return;
        }

        const face = this._model?.faces[pickInfo.subMeshId];
        console.log(face);
        if (!face) {
            return;
        }

        this.onFaceClicked?.(face);
    }

    private _onPointerMove(_e: IPointerEvent, pickInfo: PickingInfo) {
        if (!pickInfo.hit) {
            // If no hit but something was highlighted
            if (this._highlightedSubMesh) {
                this._toggleFaceHighlight(this._highlightedSubMesh.subMeshId, this._highlightedSubMesh.originalColor);
                this._highlightedSubMesh = undefined;
            }

            return;
        }

        // If hit the same submesh
        if (pickInfo.subMeshId === this._highlightedSubMesh?.subMeshId) {
            return;
        }

        // If hit and something was highlighted
        if (this._highlightedSubMesh) {
            this._toggleFaceHighlight(this._highlightedSubMesh.subMeshId, this._highlightedSubMesh.originalColor);
        }

        // Highlight the new face
        const prevColor = this._toggleFaceHighlight(pickInfo.subMeshId, Color3.Red());
        this._highlightedSubMesh = {
            subMeshId: pickInfo.subMeshId,
            originalColor: prevColor || Color3.Black() // Black should never happen here,
        };
    }

    public setModel(model: Model) {
        this._model = model;
        this._modelMesh = ModelMeshBuilder.CreateMesh(model, this.scene);

        if (this._options.highlightHoveredFace) {
            this._modelMesh.enablePointerMoveEvents = true;
        }

        this.center();
    }

    public center() {
        if (!this._modelMesh) {
            return;
        }

        this.camera.focusOn([this._modelMesh], true);
        this.camera.zoomOn([this._modelMesh], true);
    }

    public render() {
        this.scene.render();
    }
}
