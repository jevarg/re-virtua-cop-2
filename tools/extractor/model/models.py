from dataclasses import dataclass
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
