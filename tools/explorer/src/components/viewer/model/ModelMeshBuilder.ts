import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';

import { Face, MaterialFlag, Model, RenderFlag } from '../../../core/gamedata/Models/Model';
import { Texture } from '../../../core/gamedata/Textures/Texture';
import { GameData } from '../../../core/gamedata/GameData';
import { AssetType } from '../../../core/gamedata/AssetPack';
import { Rect } from '../../../core/types/Rect';
import { ModelPack } from '../../../core/gamedata/Models/ModelPack';
import { Color3, MeshBuilder } from '@babylonjs/core';
import { TextureFileName, TexturePack } from '../../../core/gamedata/Textures/TexturePack';

export class ModelMeshBuilder {
    private static _findTexturePack(model: Model, packId: number) {
        const packName = model.parent.getTexturePackName(packId);
        if (!packName) {
            throw new Error(`Cannot find texture pack with id ${packId}`);
        }

        // let packName: TextureFileName;

        // if (!packId) {
        //     packName = TextureFileName.T_COMMON;
        // } else if (model.unk) {
        //     packName = TextureFileName.T_STG2C;
        // } else {
        //     packName = TextureFileName.T_STG20;
        // }

        const texturePack = GameData.get().assets![AssetType.Texture].get(packName);
        if (!texturePack) {
            throw new Error(`Cannot find texture pack ${packName}`);
        }

        return texturePack;
    }

    private static _createTexturedMaterial(model: Model, face: Face, scene: Scene) {
        let texture: Texture;
        try {
            const texturePack = this._findTexturePack(model, face.material.texturePackId);
            console.log(`textureId: ${face.material.textureId}`);
            console.log(`texturePackId: ${face.material.texturePackId}`);
            console.log(`pack: ${texturePack.name}`);
            console.log(`pageSize: ${texturePack.pageSize}`);
            console.log(`pageOffset: ${texturePack.pageOffset}`);
            console.log(' ');

            // const tid = (face.material.textureId * face.material.texturePackId);

            const n = (face.material.texturePackId - texturePack.pageOffset);
            const n2 = n > 0 ? n : n + 1;

            console.log(`n2: ${n2}`);

            const i = face.material.textureId + (256 * n) - ((n2) * texturePack.pageSize);

            texture = texturePack.getTexture(i, face.material.texturePackId);
            // texture = texturePack.getTexture(face.material.textureId, face.material.texturePackId);
        } catch (e) {
            console.warn(model, face, e);

            const material = new StandardMaterial('fallbackMaterial', scene);
            material.emissiveColor = Color3.Gray();

            return material;
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

        const material = new StandardMaterial('texturedMaterial', scene);
        // material.opacityTexture = rawTexture;
        material.emissiveTexture = rawTexture;

        return material;
    }

    private static _createUVs(face: Face) {
        const uvRect = new Rect(0, 1, 1, 0);
        const uvs = Array<number>(8);
        if (face.material.hasMaterialFlag(MaterialFlag.InvertX)) {
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

        if (face.material.hasMaterialFlag(MaterialFlag.InvertY)) {
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

        return uvs;
    }

    private static _createColorMaterial(face: Face, scene: Scene) {
        const material = new StandardMaterial('colorMaterial', scene);
        material.emissiveColor = Color3.Red();

        return material;
    }

    public static CreateMesh(model: Model, scene: Scene): Mesh {
        const submeshes: Mesh[] = [];
        for (const face of model.faces) {
            if (!face.material.hasMaterialFlag(MaterialFlag.Enabled)) {
                continue;
            }

            const positions = [
                model.vertices[face.v1],
                model.vertices[face.v2],
                model.vertices[face.v3],
                model.vertices[face.v4],
            ].flatMap(v => [-v.x, v.y, v.z]);

            const vertexData = new VertexData();
            vertexData.positions = positions;
            vertexData.indices = [
                0, 1, 2,
                0, 2, 3,
            ];

            if (model.unk) {
                vertexData.indices = [
                    0, 2, 1,
                    0, 3, 2,
                ];
            }

            vertexData.normals = [
                ...face.normal.toArray(),
                ...face.normal.toArray(),
                ...face.normal.toArray(),
                ...face.normal.toArray()
            ];

            let material: StandardMaterial;
            if (face.material.hasMaterialFlag(MaterialFlag.Texture)) {
                material = this._createTexturedMaterial(model, face, scene)!;
                if (face.material.hasRenderFlag(RenderFlag.Transparent)) {
                    material.alpha = 0.5; // TODO: Make it dithered like the game does
                }
                vertexData.uvs = this._createUVs(face);
            } else if (face.material.hasMaterialFlag(MaterialFlag.Color)) {
                material = this._createColorMaterial(face, scene);
                vertexData.uvs = new Array<number>(8);
            }

            const mesh = new Mesh(face.id.toString());
            mesh.material = material!;

            // if (model.unk && mesh.material) {
                // mesh.material.backFaceCulling = false;
                // mesh.flipFaces(true);
            // }

            if (!mesh) {
                console.warn(`Face ${face.id}: Mesh was not created!`);
                continue;
            }

            vertexData.applyToMesh(mesh);
            submeshes.push(mesh);
        }

        const finalMesh = Mesh.MergeMeshes(submeshes, true, undefined, undefined, undefined, true);
        if (!finalMesh) {
            throw new Error('Final mesh could not be created');
        }

        finalMesh.id = model.id.toString();
        finalMesh.name = `Model ${model.id}`;

        const positions = finalMesh.getFacetLocalPositions();
        const normals = finalMesh.getFacetLocalNormals();

        const lines = [];
        for (let i = 0; i < positions.length; i++) {
            const line = [ positions[i], positions[i].add(normals[i]) ];
            lines.push(line);
        }
        const lineSystem = MeshBuilder.CreateLineSystem("ls", {lines: lines}, scene);
        lineSystem.color = Color3.Green();

        return finalMesh;
    }
}