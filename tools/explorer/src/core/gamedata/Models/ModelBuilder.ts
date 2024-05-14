import { Vec3 } from '../../types/Vec3';
import { Face, FaceMaterial, Model } from './Model';
import { ModelPack } from './ModelPack';

export class ModelBuilder {
    public static readonly headerByteSize = 16;

    private static readonly _bytesPerVertex = 12; // 12 bytes per vertex (x, y, z are 32bit floats);
    private static readonly _bytesPerFace = 20; // 20 bytes per face (v1-4 are 2bytes ints + 12bytes normal (3 * 4bytes floats));
    private static readonly _bytesPerMaterial = 10; // 10 bytes per face material

    public static build(id: number, parent: ModelPack, buffer: ArrayBufferLike): Model | undefined {
        const modelHeaderOffset = id * this.headerByteSize;
        let view = new DataView(buffer, modelHeaderOffset);

        const verticesOffset = view.getUint32(0, true);
        if (!verticesOffset) {
            return;
        }

        const facesOffset = view.getUint32(4, true);
        const materialsOffset = view.getUint32(8, true);
        const verticesCount = view.getUint16(12, true);
        const facesCount = view.getUint8(14);
        const flags = view.getUint8(15);

        const depth = (flags & 0xf0) >> 4; // High nibble
        const unk = (flags & 0x0f); // Low nibble

        view = new DataView(buffer); // Reset model pack offset

        const vertices: Vec3[] = [];
        for (let i = 0; i < verticesCount; i++) {
            const offset = verticesOffset + i * this._bytesPerVertex;

            vertices.push(new Vec3(
                view.getFloat32(offset, true),
                view.getFloat32(offset + 4, true),
                view.getFloat32(offset + 8, true)
            ));
        }

        const faces: Face[] = [];
        for (let i = 0; i < facesCount; i++) {
            const materialOffset = materialsOffset + i * this._bytesPerMaterial;
            const faceOffset = facesOffset + i * this._bytesPerFace;

            const material = new FaceMaterial(
                view.getUint8(materialOffset),
                view.getUint8(materialOffset + 1),
                view.getUint8(materialOffset + 2),
                view.getUint8(materialOffset + 3),
                view.getUint8(materialOffset + 5),
                view.getUint16(materialOffset + 6, true),
            );

            faces.push(new Face(
                i,
                view.getUint16(faceOffset, true), // v1
                view.getUint16(faceOffset + 2, true), // v2
                view.getUint16(faceOffset + 4, true), // v3
                view.getUint16(faceOffset + 6, true), // v4
                new Vec3( // Normal
                    view.getFloat32(faceOffset + 8, true), // X
                    view.getFloat32(faceOffset + 12, true), // Y
                    view.getFloat32(faceOffset + 16, true), // Z
                ),
                material
            ));
        }

        return new Model(id, modelHeaderOffset, parent, vertices, faces, depth, unk);
    }
}