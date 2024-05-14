#include <std/io.pat>
#include <std/mem.pat>

struct Color {
    u8 r, g, b, x;
} [[color(std::format("{:02X}{:02X}{:02X}", r, g, b))]];

struct Palette {
    Color colors[64 / 4];
};

Palette palettes[while(!std::mem::eof())] @ 0x00;