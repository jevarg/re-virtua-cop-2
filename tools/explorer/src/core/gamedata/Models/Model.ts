import { Vec3 } from '../../types/Vec3';
import { ModelPack } from './ModelPack';

export class Face {
    public readonly v1: number;
    public readonly v2: number;
    public readonly v3: number;
    public readonly v4: number;

    public readonly material: FaceMaterial;

    constructor(v1: number, v2: number, v3: number, v4: number, material: FaceMaterial) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.v4 = v4;
        this.material = material;
    }
}

export enum MaterialFlag {
    Texture = 0x02,
    Color = 0x04,
    InvertX = 0x10,
    InvertY = 0x20,
    Enabled = 0x40,
}

export enum RenderFlag {
    Dithered = 0x1,
    Unknown = 0x2,
}

export class FaceMaterial {
    private readonly _materialFlags: number;
    private readonly _renderFlags: number;

    public readonly textureId: number;
    public readonly texturePackId: number;

    constructor(mFlags: number, textureId: number, texturePackId: number, rFlags: number) {
        this._materialFlags = mFlags;
        this.textureId = textureId;
        this.texturePackId = texturePackId;
        this._renderFlags = rFlags;
    }

    public hasMaterialFlag(flag: MaterialFlag) {
        return Boolean(this._materialFlags & flag);
    }

    public hasRenderFlag(flag: RenderFlag) {
        return Boolean(this._renderFlags & flag);
    }
}

export class Model {
    public readonly id: number;
    public readonly parent: ModelPack;
    public readonly vertices: Vec3[];
    public readonly faces: Face[];

    constructor(id: number, parent: ModelPack, vertices: Vec3[], faces: Face[]) {
        this.id = id;
        this.parent = parent;
        this.vertices = vertices;
        this.faces = faces;
    }
}