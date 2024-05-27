# Models

- [Models](#models)
  - [Header](#header)
  - [Vertices](#vertices)
  - [Faces](#faces)
  - [Faces materials](#faces-materials)
    - [Material flags](#material-flags)
    - [Rendering flags](#rendering-flags)

Models are stored in **BIN/P_*.BIN** files divided into 4 sections.

## Header
The header consists in *n* number of model definitions until a **16 bytes** chunk of **0**s is reached. Each definition is structured like so:

|   Type | Name                 | Description                                        |
| -----: | -------------------- | -------------------------------------------------- |
| uint32 | Vertices data offset | Offset to the vertices (see [Vertices](#vertices)) |
| uint32 | Indices data offset  | Offset to the indices (see [Faces](#faces))        |
| uint32 | Material data offset | Offset to the faces materials                      |
| uint16 | Number of vertices   | The number of vertices for this model              |
|  uint8 | Number of faces      | The number of faces for this model                 |
|  uint8 | Unknown              | -                                                  |

## Vertices
Vertices are directly stored as a list of **3 &times; 32bits** float coordinates (XYZ).
|    Type | Name |
| ------: | ---- |
| float32 | x    |
| float32 | y    |
| float32 | z    |

## Faces
Since each face is rendered as a **QUAD**, 4 indices are needed for each face.

Each face is represented like so:
|    Type | Name     | Description              |
| ------: | -------- | ------------------------ |
|  uint16 | Index 1  | First index of the face  |
|  uint16 | Index 2  | Second index of the face |
|  uint16 | Index 3  | Third index of the face  |
|  uint16 | Index 4  | Fourth index of the face |
| float32 | Normal x | Normal x component       |
| float32 | Normal y | Normal y component       |
| float32 | Normal z | Normal z component       |


## Faces materials
For each face there exist one **10 bytes** material row:
|   Type | Name                | Description                                                                          |
| -----: | ------------------- | ------------------------------------------------------------------------------------ |
|  uint8 | Material flags      | Bitfield defining specific material flags (see [Material flags](#material-flags))    |
|  uint8 | Texture pack flags  | TBD (TODO)                                                                           |
|  uint8 | Texture id          | Texture index within the texture pack                                                |
|  uint8 | Texture pack id     | Texture pack id                                                                      |
|  uint8 | ?                   | Maybe texture pack id is 16bits?                                                     |
|  uint8 | Rendering flags     | Bitfield defining specific rendering flags (see [Rendering Flags](#rendering-flags)) |
| uint16 | Palette id / Color* | A palette identifier **or** a RGB555 encoded color depending on Material flags       |
| uint16 | -                   | Padding                                                                              |

*It is a palette id if the [material flags](#material-flags) has the **texture** bit set to 1, otherwise if it is the **color** bit, it is an RGB555 color.

### Material flags
Bitfield defining how materials should be applied
| Bit (LE) | Name       | Description                                      |
| -------: | ---------- | ------------------------------------------------ |
|        1 | ?          |                                                  |
|        2 | Texture    | Uses texture                                     |
|        3 | Color      | Uses flat color                                  |
|        4 | ?          |                                                  |
|        5 | Inversed X | If set, will be rendered with X inversed texture |
|        6 | Inversed Y | If set, will be rendered with Y inversed texture |
|        7 | ?          |                                                  |
|        8 | ?          |                                                  |

### Rendering flags
Bitfield defining how materials should be rendered
| Bit (LE) | Name        | Description              |
| -------: | ----------- | ------------------------ |
|        1 | Transparent | Render with transparency |
|        2 | ?           |                          |
|        3 | ?           |                          |
|        4 | ?           |                          |
|        5 | ?           |                          |
|        6 | ?           |                          |
|        7 | ?           |                          |
|        8 | ?           |                          |
