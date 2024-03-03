import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';

import { MaterialFlag, Model } from '../../../core/gamedata/Models/Model';
import { Texture } from '../../../core/gamedata/Textures/Texture';
import { GameData } from '../../../core/gamedata/GameData';
import { AssetType } from '../../../core/gamedata/AssetPack';
import { Rect } from '../../../core/types/Rect';
import { ModelPack } from '../../../core/gamedata/Models/ModelPack';
import { Color3 } from '@babylonjs/core';

export class ModelMeshBuilder {
    private static _findTexturePack(modelPack: ModelPack, packId: number) {
        const texturePackId = modelPack.getTexturePackName(packId);
        if (!texturePackId) {
            throw new Error(`Cannot find texture pack with id ${packId}`);
        }

        const texturePack = GameData.get().assets![AssetType.Texture].get(texturePackId);
        if (!texturePack) {
            throw new Error(`Cannot find texture pack ${texturePackId}`);
        }

        return texturePack;
    }

    public static CreateMesh(model: Model, scene: Scene): Mesh {
        const submeshes: Mesh[] = [];
        for (const [i, f] of model.faces.entries()) {
            if (!f.material.hasMaterialFlag(MaterialFlag.Enabled) ||
                !f.material.hasMaterialFlag(MaterialFlag.Texture)) {
                continue;
            }

            let texture: Texture;
            try {
                const texturePack = this._findTexturePack(model.parent, f.material.texturePackId);
                texture = texturePack.getTexture(f.material.textureId - texturePack.offset);
            } catch (e) {
                console.warn(e);
                continue;
            }

            const uvRect = new Rect(0, 1, 1, 0);
            const positions = [
                model.vertices[f.v1],
                model.vertices[f.v2],
                model.vertices[f.v3],
                model.vertices[f.v4],
            ].flatMap(v => [-v.x, v.y, v.z]);

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
            material.opacityTexture = rawTexture;
            material.emissiveTexture = rawTexture;

            const mesh = new Mesh(i.toString());
            mesh.material = material;

            const vertexData = new VertexData();
            vertexData.positions = positions;
            vertexData.uvs = uvs;
            vertexData.indices = [
                0, 1, 2,
                0, 2, 3,
            ];

            vertexData.applyToMesh(mesh);
            submeshes.push(mesh);
        }

        const finalMesh = Mesh.MergeMeshes(submeshes, true, undefined, undefined, undefined, true);
        if (!finalMesh) {
            throw new Error('Final mesh could not be created');
        }

        return finalMesh;
    }
}