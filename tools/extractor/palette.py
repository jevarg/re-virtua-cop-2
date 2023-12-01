from dataclasses import dataclass
import struct
from typing import List

@dataclass
class RGBAColor:
    r: int
    g: int
    b: int
    a: int

@dataclass
class RGBColor:
    r: int
    g: int
    b: int

    def toByteArray(self):
        return bytearray([self.r, self.g, self.b, 0])

    def toInt(self):
        return struct.unpack("<I", self.toByteArray())[0]

class ColorPalette():
    COLORS_COUNT = 16

    colors: List[RGBColor] = []
