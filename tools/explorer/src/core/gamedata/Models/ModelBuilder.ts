import { Vec3 } from '../../types/Vec3';
import { Vec4 } from '../../types/Vec4';
import { Model } from './Model';

export class ModelBuilder {
    public static readonly headerByteSize = 16;

    public static build(id: number, buffer: ArrayBufferLike): Model | undefined {
        let view = new DataView(buffer, id * this.headerByteSize);

        const verticesOffset = view.getUint32(0, true);
        if (!verticesOffset) {
            return;
        }

        const indicesOffset = view.getUint32(4, true);
        // const materialOffset = view.getUint32(8, true);
        const verticesCount = view.getUint16(12, true);
        const facesCount = view.getUint8(14);

        view = new DataView(buffer);

        const vertices: Vec3[] = [];
        for (let i = 0; i < verticesCount; i++) {
            const offset = verticesOffset + i * 12; // 12 bytes per vertex (x, y, z are 32bit floats);

            vertices.push(new Vec3(
                view.getFloat32(offset, true),
                view.getFloat32(offset + 4, true),
                view.getFloat32(offset + 8, true)
            ));
        }

        const indices: Vec4[] = [];
        for (let i = 0; i < facesCount; i++) {
            const offset = indicesOffset + i * 20; // 20 bytes per face (v1-4 are 16bit ints + 12 unknown bytes);

            indices.push(new Vec4(
                view.getUint16(offset, true),
                view.getUint16(offset + 2, true),
                view.getUint16(offset + 4, true),
                view.getUint16(offset + 6, true),
            ));
        }

        return new Model(vertices, indices);
    }
}