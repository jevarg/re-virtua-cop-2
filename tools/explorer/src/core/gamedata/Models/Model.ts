import { Vec3 } from '../../types/Vec3';
import { TexturePackName } from '../Textures/TexturePack';
import { ModelPack, ModelPackName } from './ModelPack';

export class Face {
    public readonly id: number;
    public readonly v1: number;
    public readonly v2: number;
    public readonly v3: number;
    public readonly v4: number;
    public readonly normal: Vec3;

    public readonly material: FaceMaterial;

    constructor(id: number, v1: number, v2: number, v3: number, v4: number, normal: Vec3, material: FaceMaterial) {
        this.id = id;
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.v4 = v4;
        this.normal = normal;
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
    Transparent = 0x1,
    Unknown = 0x2,
}

export class FaceMaterial {
    private readonly _materialFlags: number;
    private readonly _renderFlags: number;
    private readonly _textureFlags: number;

    public readonly textureId: number;
    public readonly texturePackId: number;

    constructor(mFlags: number, tFlags: number, textureId: number, texturePackId: number, rFlags: number) {
        this._materialFlags = mFlags;
        this._textureFlags = tFlags;
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

    public textureOffset() {
        if (this._textureFlags == 0x4) {
            return 0;
        } else {
            return 1;
        }
    }
}

export class Model {
    public readonly id: number;
    public readonly headerOffset: number;
    public readonly parent: ModelPack;
    public readonly vertices: Vec3[];
    public readonly faces: Face[];
    public readonly depth: number;
    public readonly unk: number;

    constructor(id: number, headerOffset: number, parent: ModelPack, vertices: Vec3[], faces: Face[], depth: number, unk: number) {
        this.id = id;
        this.headerOffset = headerOffset;
        this.parent = parent;
        this.vertices = vertices;
        this.faces = faces;
        this.depth = depth;
        this.unk = unk;
    }

    public getTexturePack(packId: number) {
        if (packId === 0) {
            return TexturePackName.T_COMMON;
        }

        const modelPackType = this.parent.name as ModelPackName;
        if (this.parent.isStage && (this.unk || this.depth)) {
            return `T_${modelPackType.substring(2, 6)}C.BIN` as TexturePackName;
        } else if (modelPackType === ModelPackName.P_SEL) {
            return TexturePackName.T_SELECT;
        } else {
            return `T_${modelPackType.substring(2)}` as TexturePackName;
        }
    }
}