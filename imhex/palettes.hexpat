#include <std/io.pat>
#include <std/mem.pat>
#include <std/math.pat>

#pragma pattern_limit 9999999
#pragma array_limit 9999999

#define COLOR_COMPONENTS 4
#define BYTE_SIZE 64
#define COLOR_COUNT (BYTE_SIZE / COLOR_COMPONENTS)

struct Color {
    u8 r, g, b, x;
} [[color(std::format("{:02X}{:02X}{:02X}", r, g, b))]];

struct Palette {
    u32 size = std::mem::size() - $;
    size = std::math::min(size / 4, 64 / 4);

    Color color[size];
};

Palette palettes[while(!std::mem::eof())] @ 0x00;