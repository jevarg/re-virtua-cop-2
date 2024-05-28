# Textures
Textures are stored in **T_*.BIN** files. They are encoded using **8bit** palette indices.

All the textures metadata are defined in the game executable, there are 22 texture packs defined (not all of them seem to exist in the game files though).

> :warning: Note that since the data are defined within the game executable, all addresses are virtual and need to be transformed into raw addresses.

Virtual addresses can be translated to raw like this:
```c
#define RDATA_SECTION_ADDR 0x0004d400
#define VDATA_SECTION_ADDR 0x0044f000
#define RAW_RELATIVE_OFF (RDATA_SECTION_ADDR - VDATA_SECTION_ADDR)

uint32_t virtualToRawAddr(uint32_t virtualAddr) {
    return virtualAddr + RAW_RELATIVE_OFF;
};
```

For example, `virtual 0x00458fd0` -> `raw 0x000573d0`.

## Texture Pack
Each texture pack is defined like so:
|   Type | Name                  | Description                                                                                  |
| -----: | --------------------- | -------------------------------------------------------------------------------------------- |
| uint32 | File name ptr         | Offset to char[16] of the texture file name (e.g. `T_COMMON.BIN`)                            |
| uint32 | Palette file name ptr | Offset to char[16] of the palette file name (e.g. `P_COMMON.BIN`)                            |
| uint32 | Textures metadata ptr | Offset to the start of all the textures metadata (see [Texture Metadata](#texture-metadata)) |
|  uint8 | Offset?               |                                                                                              |
|  uint8 | Id                    |                                                                                              |
| uint16 | -                     | Padding                                                                                      |
| uint32 | Count ptr             | Offset to a uint32 representing the number of tetxures in the current pack                   |
| uint32 | ?                     |                                                                                              |

## Texture Metadata
Defines all the metadata needed to retrieve a texture within the texture pack (**.BIN** file)
|   Type | Name           | Description                                              |
| -----: | -------------- | -------------------------------------------------------- |
| uint16 | Width          | Width of the texture                                     |
| uint16 | Height         | Height of the texture                                    |
| uint32 | Palette offset | Offset in the palette file (see [Palettes](palettes.md)) |
| uint32 | ?              | Unknown                                                  |
|  uint8 |                | Texture flags (see [Texture flags](#texture-flags))      |

## Texture flags
Bitfield defining texture type
| Bit (LE) | Name         | Description                                                   |
| -------: | ------------ | ------------------------------------------------------------- |
|        1 | ?            | Maybe unused                                                  |
|        2 | Transparency | If set, pixels with palette index 0 will be fully transparent |
|        3 | UI           | Texture is 2D UI                                              |
|        4 | -            |                                                               |
|        5 | -            |                                                               |
|        6 | -            |                                                               |
|        7 | -            |                                                               |
|        8 | -            |                                                               |
