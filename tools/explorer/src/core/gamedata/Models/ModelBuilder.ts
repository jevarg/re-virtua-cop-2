import { Vec3 } from '../../types/Vec3';
import { Face, FaceMaterial, Model } from './Model';

export class ModelBuilder {
    public static readonly headerByteSize = 16;

    private static readonly _bytesPerVertex = 12; // 12 bytes per vertex (x, y, z are 32bit floats);
    private static readonly _bytesPerFace = 20; // // 20 bytes per face (v1-4 are 16bit ints + 12 unknown bytes);
    private static readonly _bytesPerMaterial = 10; // 10 bytes per face material

    public static build(id: number, buffer: ArrayBufferLike): Model | undefined {
        let view = new DataView(buffer, id * this.headerByteSize);

        const verticesOffset = view.getUint32(0, true);
        if (!verticesOffset) {
            return;
        }

        const facesOffset = view.getUint32(4, true);
        const materialsOffset = view.getUint32(8, true);
        const verticesCount = view.getUint16(12, true);
        const facesCount = view.getUint8(14);

        view = new DataView(buffer);

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
                view.getUint8(materialOffset + 2),
                view.getUint8(materialOffset + 3),
                view.getUint8(materialOffset + 5)
            );

            faces.push(new Face(
                view.getUint16(faceOffset, true),
                view.getUint16(faceOffset + 2, true),
                view.getUint16(faceOffset + 4, true),
                view.getUint16(faceOffset + 6, true),
                material
            ));
        }

        return new Model(id, vertices, faces);
    }
}