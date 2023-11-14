from collections import namedtuple
from dataclasses import dataclass
from io import BufferedReader
import os
from pathlib import Path
import struct
import sys
from typing import NamedTuple

@dataclass
class Vertex(NamedTuple):
    x: float
    y: float
    z: float

@dataclass
class Index(NamedTuple):
    v1: int
    v2: int
    v3: int
    v4: int

@dataclass
class Model:
    vertices: list[Vertex]
    indices: list[Index]

def extract(data: bytes, out_dir: str):
    models: list[Model] = []

    i = 0
    header_size = struct.calcsize("IIIHBx")
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
        read_size = struct.calcsize("HHHH12x")
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

def usage():
    print(f"usage: {sys.argv[0]} <RESOURCE_FILE.BIN> [out_dir]")
    return 1

def main():
    args_count = len(sys.argv)
    if args_count < 2:
        return usage()

    res_path = sys.argv[1]

    if args_count > 2:
        out_dir = sys.argv[2]
    else:
        out_dir = Path(res_path).stem

    with open(res_path, "rb") as file:
        data = file.read()
        extract(data, out_dir)

if __name__ == "__main__":
    main()
