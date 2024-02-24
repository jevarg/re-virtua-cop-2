import os
import struct

from model.models import Model, Vertex, Index

def extract_models(data: bytes, out_dir: str):
    models: list[Model] = []

    i = 0
    header_size = struct.calcsize("IIIHBx") # 16 bytes
    while i < len(data):
        (vtx_offset, idx_offset, tex_offset, vtx_count, face_count) = struct.unpack_from("IIIHBx", data, i * header_size)
        if vtx_offset == 0:
            break # Let's assume that if we have no vertex, we are done reading

        vertices: list[Vertex] = []
        read_size = struct.calcsize("fff")
        for v in range(vtx_count):
            vertex = struct.unpack_from("fff", data, vtx_offset + (v * read_size))
            vertices.append(Vertex._make(vertex))

        indices: list[int] = []
        read_size = struct.calcsize("HHHH12x") # 20 bytes
        for f in range(face_count):
            face = struct.unpack_from("HHHH12x", data, idx_offset + (f * read_size))
            indices.append(Index._make(face))

        m = Model(vertices, indices)
        models.append(m)

        print(f"{i}: {vtx_count} vertices, {face_count} faces")

        i += 1

    print(f"Successfully loaded {len(models)} models")

    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    file_id = 0
    for m in models:
        with open(f"{out_dir}/{file_id}.obj", "w+") as out:
            for v in m.vertices:
                out.write(f"v {v.x} {v.y} {v.z}\n")

            for i in m.indices:
                out.write(f"f {i.v1 + 1} {i.v2 + 1} {i.v3 + 1} {i.v4 + 1}\n")

            file_id += 1