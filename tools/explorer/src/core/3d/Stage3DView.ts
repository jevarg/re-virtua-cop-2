import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PickingInfo } from '@babylonjs/core/Collisions/pickingInfo';
import { Engine } from '@babylonjs/core/Engines/engine';
import { IPointerEvent } from '@babylonjs/core/Events/deviceInputEvents';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { Model, ModelPack } from '@VCRE/core/gamedata';

import { ModelMeshBuilder } from './ModelMeshBuilder';

export class Stage3DView {
    public readonly engine: Engine;
    public readonly scene: Scene;
    public readonly camera: UniversalCamera;

    private _models = new Map<number, Model>();

    constructor(engine: Engine, canvas: HTMLCanvasElement) {
        this.engine = engine;
        this.scene = new Scene(engine);
        this.scene.clearColor = Color3.Black().toColor4(1);
        this.scene.onPointerDown = this._onPointerDown.bind(this);

        this.camera = new UniversalCamera('universalCamera', new Vector3(0, 5, 0), this.scene);
        this.camera.fov = 1;
        this.camera.keysUpward.push(69); // increase elevation
        this.camera.keysDownward.push(81); // decrease elevation
        this.camera.keysUp.push(87); // forwards
        this.camera.keysDown.push(83); // backwards
        this.camera.keysLeft.push(65);
        this.camera.keysRight.push(68);
        this.camera.inertia = 0;
        this.camera.angularSensibility = 500;
        this.camera.target = new Vector3(0, 0, 0);
        this.camera.minZ = 0;
        this.camera.maxZ = 100;
        this.camera.speed = 10;
        this.camera.attachControl(canvas, true);
    }

    private _onPointerDown(_e: IPointerEvent, pickInfo: PickingInfo) {
        if (!pickInfo.hit || !pickInfo.pickedMesh) {
            return;
        }

        const model = this._models.get(Number(pickInfo.pickedMesh.id));
        console.log('Mesh', pickInfo.pickedMesh.getPositionData());
        console.log('Model', model);
        console.log('Face', model?.faces[pickInfo.subMeshId]);
    }

    public async loadStage(stage: ModelPack, min: number | undefined = undefined, max: number | undefined = undefined) {
        const meshes: Mesh[] = [];
        for (const model of stage.models) {
            if (model.id < (min || -1)) {
                continue;
            }

            if (model.id === max) {
                break;
            }

            const mesh = await ModelMeshBuilder.CreateMesh(model, this.scene);
            meshes.push(mesh);
            this._models.set(model.id, model);
        }

        // console.log(`Before pack: ${this.scene.textures.length}`);

        // TODO: investigate texture packer
        // const pack = new TexturePacker('TestPack', meshes, {
        //     frameSize: 256,
        //     layout: TexturePacker.LAYOUT_POWER2,
        //     paddingMode: TexturePacker.SUBUV_EXTEND,
        // }, this.scene);

        // await pack.processAsync();

        // console.log(`After pack: ${this.scene.textures.length}`);
    }
}