import { Vec3 } from '../../types/Vec3';
import { Vec4 } from '../../types/Vec4';

export class Model {
    public readonly vertices: Vec3[];
    public readonly indices: Vec4[];

    constructor(vertices: Vec3[], indices: Vec4[]) {
        this.vertices = vertices;
        this.indices = indices;
    }
}