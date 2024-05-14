#include <std/io.pat>
#include <std/mem.pat>
#include <std/math.pat>

#pragma pattern_limit 999999999

#define INDICES_PADDING 6
#define VERTICES_PER_FACE 4
#define VERTEX_COMPONENTS_COUNT 3


struct Vec3 {
    float x;
    float y;
    float z;

    float length = std::math::sqrt(std::math::pow(x, 2) + std::math::pow(y, 2) + std::math::pow(z, 2));
};

bitfield MaterialFlags {
    padding : 1;

    texture : 1;
    color : 1;

    padding : 1;

    x_inv : 1;
    y_inv : 1;

    enabled : 1;
};

bitfield RenderFlags {
    transparent : 1;
    padding : 1;
    notSure : 1;
};

struct Face {
    u16 indices[4];
    Vec3 normal;
};

bitfield RGB565 {
    r : 5;
    g : 5;
    b : 5;
} [[color(std::format("{:02X}{:02X}{:02X}", u8(r / 31.0 * 255.0), u8(g / 31.0 * 255.0), u8(b / 31.0 * 255.0)))]];

struct Material {
    MaterialFlags mFlags;
    u8 texPackFlag;
    u8 texID;
    u8 texSheetID;
    padding[1];
    RenderFlags rFlags;

    if (mFlags.texture) {
        u8 paletteID [[color("FFFFFF")]];
        padding[1];
    } else {
        RGB565 color;
    }

    padding[2];
};

struct Model {
    float *vertices_addr : u32;
    u16 *faces_addr : u32;
    u16 *material_addr : u32;
    u16 vertices_count;
    u8 faces_count;
    u8;

    Vec3 vertices[vertices_count] @ addressof(vertices_addr);
    Face faces[faces_count] @ addressof(faces_addr);
    Material materials[faces_count] @ addressof(material_addr);

};

//Model models[while(std::mem::read_unsigned($, 16) != 0x00)] @ 0x00;
Model models[4] @ 0x00;
//Model tire @ 0x370;

std::print("done");