# Color palettes
Color palettes are defined in **L_*.BIN** files.

Each file contains several **64 bits** (16 colors) color palettes.

| Size   | Name | Description       |
| ------ | ---- | ----------------- |
| 1 byte | R    | Red color value   |
| 1 byte | G    | Green color value |
| 1 byte | B    | Blue color value  |
| 1 byte | X    | Padding           |

## Example
`L_LOGO.BIN` captured using ImHex with the `palettes.hexpat` pattern

![logo-palette-imhex](../.doc/logo-palette-imhex.png)
