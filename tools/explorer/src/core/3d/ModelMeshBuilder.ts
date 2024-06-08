import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture as BabylonTexture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Scene } from '@babylonjs/core/scene';
import { AssetType, Face, GameData, MaterialFlag, Model, RenderFlag, Texture, TextureFlag, TexturePack } from '@VCRE/core/gamedata';
import { Rect } from '@VCRE/core/types';

export class ModelMeshBuilder {
    private static _findTexturePack(model: Model, packId: number) {
        const packType = model.getTexturePack(packId);
        if (!packType) {
            throw new Error(`Cannot find texture pack with id ${packId}`);
        }

        const texturePack = GameData.get().assets![AssetType.Texture].get(packType);
        if (!texturePack) {
            throw new Error(`Cannot find texture pack ${packType}`);
        }

        return texturePack;
    }

    private static _createTexturedMaterial(model: Model, face: Face, scene: Scene, textures: Map<string, RawTexture>) {
        let texture: Texture;
        let texturePack: TexturePack;
        try {
            texturePack = this._findTexturePack(model, face.material.texturePackId);
            // console.log(`textureId: ${face.material.textureId}`);
            // console.log(`texturePackId: ${face.material.texturePackId}`);
            // console.log(`pack: ${texturePack.name}`);
            // console.log(`pageSize: ${texturePack.pageSize}`);
            // console.log(`pageOffset: ${texturePack.pageOffset}`);
            // console.log(' ');

            // const tid = (face.material.textureId * face.material.texturePackId);

            const n = (face.material.texturePackId - texturePack.pageOffset);
            const n2 = n > 0 ? n : n + 1;

            // console.log(`n2: ${n2}`);

            const i = face.material.textureId + (256 * n) - ((n2) * texturePack.pageSize);
            texture = texturePack.getTexture(i);
            // texture = texturePack.getTexture(face.material.textureId, face.material.texturePackId);
        } catch (e) {
            console.warn(model, face, e);

            const material = new StandardMaterial('fallbackMaterial', scene);
            material.emissiveColor = Color3.Red();

            return material;
        }

        const textureKey = `${texturePack.name}/${face.material.textureId}`;
        let rawTexture = textures.get(textureKey);
        if (!rawTexture) {
            rawTexture = RawTexture.CreateRGBATexture(
                texture.pixels,
                texture.info.width,
                texture.info.height,
                scene,
                true,
                false,
                BabylonTexture.NEAREST_SAMPLINGMODE
            );
            textures.set(textureKey, rawTexture);
        }

        const material = new StandardMaterial('texturedMaterial', scene);
        material.diffuseTexture = rawTexture;
        material.emissiveColor = Color3.White();

        if (texture.info.hasFlag(TextureFlag.Alpha)) {
            material.diffuseTexture.hasAlpha = true;
            material.useAlphaFromDiffuseTexture = true;
        }

        return material;
    }

    private static _createUVs(face: Face) {
        const uvRect = new Rect(0, 1, 1, 0);
        const uvs = Array<number>(8);

        // X UVs
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

        // Y UVs
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
        material.diffuseColor = Color3.FromArray(face.material.color?.toArray() || []);
        material.emissiveColor = material.diffuseColor;

        return material;
    }

    public static async CreateMesh(model: Model, scene: Scene): Promise<Mesh> {
        const submeshes: Mesh[] = [];
        const textures = new Map<string, RawTexture>();
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

            if (model.depth) {
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
                material = this._createTexturedMaterial(model, face, scene, textures)!;
                vertexData.uvs = this._createUVs(face);
            } else if (face.material.hasMaterialFlag(MaterialFlag.Color)) {
                material = this._createColorMaterial(face, scene);
                vertexData.uvs = new Array<number>(8);
            } else {
                material = new StandardMaterial('fallbackMaterial', scene);
                material.emissiveColor = Color3.Red(); // Visual debug
            }

            if (face.material.hasRenderFlag(RenderFlag.Transparent)) {
                material.alpha = 0.5;
            }

            material.disableLighting = true;
            material.backFaceCulling = false;

            const mesh = new Mesh(face.id.toString());
            mesh.material = material;

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

        // Not sure about this...
        if (model.depth & 0xf) {
            finalMesh.renderingGroupId = 0;
        } else {
            finalMesh.renderingGroupId = 1;
        }

        // console.info((finalMesh.material as StandardMaterial));
        // finalMesh.alphaIndex = model.depth;

        // const positions = finalMesh.getFacetLocalPositions();
        // const normals = finalMesh.getFacetLocalNormals();

        // const lines = [];
        // for (let i = 0; i < positions.length; i++) {
        //     const line = [ positions[i], positions[i].add(normals[i])];
        //     lines.push(line);
        // }
        // const lineSystem = MeshBuilder.CreateLineSystem('ls', {lines: lines}, scene);
        // lineSystem.color = Color3.Green();
        // lineSystem.renderingGroupId = 3;

        return finalMesh;
    }
}