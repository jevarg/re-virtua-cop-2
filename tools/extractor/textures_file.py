from dataclasses import dataclass
import os
from pathlib import Path
import struct
from typing import Optional
from palette import ColorPalette, RGBColor
from context import Context
from PIL import Image

@dataclass
class TextureFlags():
    raw_val: int

    def alpha(self) -> bool:
        return self.raw_val & 0x2

    def hud(self) -> bool:
        return self.raw_val & 0x4

    def __repr__(self) -> str:
        r = ""

        if self.alpha():
            r += "alpha"

        return r

class Texture():
    FORMAT = "HHB7xB3x"
    BYTES_SIZE = struct.calcsize(FORMAT)

    data: Optional[bytes] = None

    id: int
    width: int
    height: int
    palette_offset: int
    flags: TextureFlags
    offset: int

    def __repr__(self) -> str:
        return f"Texture(id={self.id} width={self.width} height={self.height} palette_offset={self.palette_offset} flags={self.flags})"

    def __init__(self, id: int, w: int, h: int, palette_offset: int, flags: int) -> None:
        self.id = id
        self.width = w
        self.height = h
        self.palette_offset = palette_offset
        self.flags = TextureFlags(flags)

class Tile():
    data: Optional[bytes] = None
    textures: list[Texture] = list()

class TexturesFile():
    FORMAT = "IIIIII"
    BYTES_SIZE = struct.calcsize(FORMAT)

    __file_name: str
    __palette_name: str
    __textures: list[Texture]
    __palettes: dict[int, ColorPalette]
    __data: bytes

    def __repr__(self) -> str:
        return f"TexturesFile(file={self.__file_name} palette={self.__palette_name} textures={len(self.__textures)} items)"

    def __init__(self, file_name: str, palette_name: str, textures: list[Texture]) -> None:
        self.__file_name = file_name
        self.__palette_name = palette_name
        self.__textures = textures
        self.__data = bytes()

        self.__load()

    def __load(self):
        file_path = os.path.join(Context.bin_dir, self.__file_name)
        palette_path = os.path.join(Context.bin_dir, self.__palette_name)

        textures_data: bytes
        palette_data: bytes

        with open(file_path, "rb") as f:
            textures_data = f.read()
        with open(palette_path, "rb") as f:
            palette_data = f.read()

        for i in range(len(palette_data) // ColorPalette.COLORS_COUNT // 4):
            palette_offset = i * ColorPalette.COLORS_COUNT * 4
            p = ColorPalette()
            for c in range(ColorPalette.COLORS_COUNT):
                (a, b, g, r) = struct.unpack_from("4B", palette_data, palette_offset + c * 4)
                color = RGBColor(r, g, b)
                p.colors.append(color)

            self.__palettes[i] = p

        for t in self.__textures:
            texture_size = t.width * t.height
            indexes = struct.unpack_from(f"{texture_size}B", textures_data, t.offset)
            t.data = bytes(indexes)

            # pixels: list[int] = []
            # for index in indexes:
            #     color = RGBColor(*struct.unpack_from("3Bx", palette_data, t.palette_offset * 64 + index * 4))

            #     alpha = 0xff
            #     if index == 0 and t.flags.alpha():
            #         alpha = 0x00

            #     pixels.extend([color.r, color.g, color.b, alpha])

            # t.data = bytes(pixels)

    def __export__texture(self, t: Texture, out_dir: str):
        file_path = os.path.join(out_dir, f'{t.id}.png')

        img = Image.frombytes('RGBA', (t.width, t.height), t.data)
        img.save(file_path)

    def extract(self, id: int):
        out_dir = os.path.join(Context.out_dir, Path(self.__file_name).stem)
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)

        t = self.__textures[id]
        file_path = os.path.join(out_dir, f'{t.id}.bin')

        with open(file_path, 'w+b') as f:
            f.write(t.data)

    def export(self, id: int = None):
        out_dir = os.path.join(Context.out_dir, Path(self.__file_name).stem)
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)

        if id is not None:
            t = self.__textures[id]
            self.__export__texture(t, out_dir)
        else:
            for t in self.__textures:
                self.__export__texture(t, out_dir)
