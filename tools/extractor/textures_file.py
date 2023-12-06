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
    __textures: dict[int, list[Texture]]
    # __palettes: dict[int, ColorPalette]
    __textures_data: bytes
    __palette_data: bytes
    __atlas_data: bytearray

    __unpacked_textures: list[int]

    def __repr__(self) -> str:
        return f"TexturesFile(file={self.__file_name} palette={self.__palette_name} textures={len(self.__textures)} items)"

    def __init__(self, file_name: str, palette_name: str, textures: dict[int, list[Texture]]) -> None:
        self.__file_name = file_name
        self.__palette_name = palette_name
        self.__textures = textures
        self.__atlas_data = bytearray(256 * 9999)
        self.__unpacked_textures = []

        self.__load()

    def __load(self):
        file_path = os.path.join(Context.bin_dir, self.__file_name)
        palette_path = os.path.join(Context.bin_dir, self.__palette_name)

        with open(file_path, "rb") as f:
            self.__textures_data = f.read()
        with open(palette_path, "rb") as f:
            self.__palette_data = f.read()
        
        self.__pack_textures(0, 0, 256, 256)

    def __pack_textures(self, x_off: int, y_off: int, avail_width: int, avail_height: int):
        print(f"\nx_off: {x_off} y_off: {y_off} avail_width: {avail_width} avail_height: {avail_height}")
    
        count = 0
        while count <= 0:
            textures: list[Texture] = None
            tex_width = avail_width
            while textures is None:
                if tex_width <= 0:
                    print(f"skipped {avail_width}")
                    return # done

                textures = self.__textures.get(tex_width)
                tex_width -= 1

            x_atlas = x_off
            y_atlas = y_off

            print(f"tex_width: {tex_width}")

            for t in textures:
                if t.id in self.__unpacked_textures:
                    print(f"{t.id} already unpacked")
                    continue

                print(f"t.id: {t.id}")
                if t.height <= avail_height:
                    for y in range(t.height):
                        for x in range(t.width):
                            t_index = y * t.width + x
                            b = struct.unpack_from("B", self.__textures_data, t.offset + t_index)[0]
                            self.__atlas_data[y_atlas * avail_width + x_atlas + x] = b
                        self.__unpacked_textures.append(t.id)
                        count += 1
                        y_atlas += 1
                else:
                    pass
                    # if y_atlas >= height:
                    #     self.__pack_textures(t.id, width, y_atlas)
                    #     return
            print(f"count: {count}")
            if count > 0:
                self.__pack_textures(x_off + avail_width, y_off, avail_width - tex_width, avail_height)
                self.__pack_textures(0, y_atlas, avail_width, avail_height)
                break
            else:
                tex_width

            # else: # t.height <= height
                
                    # texture_size = t.width * t.height
                    # t_data = struct.unpack_from(f"{texture_size}B", self.__textures_data, t.offset)
        # for t in self.__textures:
        #     texture_size = t.width * t.height
        #     indexes = struct.unpack_from(f"{texture_size}B", textures_data, t.offset)
        #     t.data = bytes(indexes)

        #     pixels: list[int] = []
        #     for index in indexes:
        #         color = RGBColor(*struct.unpack_from("3Bx", palette_data, t.palette_offset * 64 + index * 4))

        #         alpha = 0xff
        #         if index == 0 and t.flags.alpha():
        #             alpha = 0x00

        #         pixels.extend([color.r, color.g, color.b, alpha])

        #     t.data = bytes(pixels)

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
