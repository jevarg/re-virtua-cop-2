# Models

- [Models](#models)
  - [Header](#header)
  - [Vertices](#vertices)
  - [Faces](#faces)
  - [Faces materials](#faces-materials)
    - [Material flags](#material-flags)

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
|  Type | Name               | Description                                                              |
| ----: | ------------------ | ------------------------------------------------------------------------ |
| uint8 | Material flags     | Bitfield defining specific flags (see [Material flags](#material-flags)) |
| uint8 | Texture pack flags | TBD (TODO)                                                               |
| uint8 | Texture id         | Texture index within the texture pack                                    |
| uint8 | Texture pack id    | Texture pack id                                                          |
| uint8 | -                  | -                                                                        |
| uint8 | Render flags       | Bitfield                                                                 |

### Material flags
