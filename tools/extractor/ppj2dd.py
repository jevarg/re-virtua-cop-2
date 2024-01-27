from contextvars import ContextVar
import os
import struct
from typing import Final, List
from textures_file import TexturesFile, Texture, Tile
from model.textures import TextureType

RDATA_SECTION_ADDR: Final[int] = 0x0004D400
VDATA_SECTION_ADDR: Final[int] = 0x0044F000
TEXTURES_ADDR: Final[int] = 0x00458FD0

class PPJ2DD():
    __data: bytes

    # root_dir: str
    file_name: str
    textures: dict[TextureType, TexturesFile] = {}

    @staticmethod
    def __to_raw_addr(addr: int):
        raw_addr = addr - VDATA_SECTION_ADDR + RDATA_SECTION_ADDR
        if raw_addr < 0:
            raise Exception(f"Invalid virtual address {hex(addr)}")

        return raw_addr

    def __init__(self, file_path: str) -> None:
        with open(file_path, "rb") as file:
            self.file_name = file_path
            self.__data = file.read()

        self.__load_assets()

    def __v_unpack(self, fmt: str, v_offset: int):
        raw_offset = PPJ2DD.__to_raw_addr(v_offset)
        if raw_offset <= 0:
            print(v_offset)
        return struct.unpack_from(fmt, self.__data, raw_offset)

    def __load_assets(self):
        self.__load_textures()

    def __load_textures(self):
        for tex_type in TextureType:
            print(f"Loading TextureType {tex_type}")

            (
                v_file_name_off,
                v_palette_file_name_off,
                v_textures_off,
                __unknown,
                v_count_ptr,
                __unknown
            ) = self.__v_unpack(TexturesFile.FORMAT, TEXTURES_ADDR + tex_type * TexturesFile.BYTES_SIZE)

            file_name: str = self.__v_unpack("@16s", v_file_name_off)[0].decode()
            file_name = file_name[:file_name.index('\0')]

            palette_file_name: str = self.__v_unpack("@16s", v_palette_file_name_off)[0].decode()
            palette_file_name = palette_file_name[:palette_file_name.index('\0')]

            print(f"Texture file: {file_name}")
            print(f"Palette file: {palette_file_name}")

            try:
                textures_count: int = self.__v_unpack("I", v_count_ptr)[0]
                texture_data_off = 0
                textures: dict[int, list[Texture]] = {}
                c = 0
                if v_textures_off > 0:
                    for i in range(textures_count):
                        t = Texture(i, *self.__v_unpack(
                            Texture.FORMAT,
                            v_textures_off + (Texture.BYTES_SIZE * i)
                        ))

                        t.offset = texture_data_off
                        texture_data_off += t.width * t.height

                        if t.flags.ui():
                            continue

                        if textures.get(t.width) is None:
                            textures[t.width] = []

                        textures[t.width].append(t)

                        c += 1

                print(f"Total non-UI textures: {c}")
                self.textures[tex_type] = TexturesFile(file_name, palette_file_name, textures, c)
                # self.textures[tex_type].extract(0)
                # self.textures[tex_type].export()
                # exit()
            except Exception as e:
                print(f"Skipping {file_name}: {e}")
                raise e

            print("\n")
            return
