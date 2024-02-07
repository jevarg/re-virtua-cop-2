#include <std/io.pat>
#include <std/mem.pat>

#define INDICES_PADDING 6
#define VERTICES_PER_FACE 4
#define VERTEX_COMPONENTS_COUNT 3


fn calc_vertices_size(u16 vertices_count) {
    return vertices_count * VERTEX_COMPONENTS_COUNT;
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

struct Index {
    u16 face[4];
    padding[12];
};

struct Material {
    MaterialFlags flags;
    padding[1];    
    u8 texID;
    u8 texSheetID;
    padding[4];
    padding[2];
};

struct Model {
    float *vertices_addr : u32;
    u16 *indices_addr : u32;
    u16 *material_addr : u32;
    u16 vertices_count;
    u16 faces_count;

    float vertices[calc_vertices_size(vertices_count)] @ addressof(vertices_addr);
    Index indices[faces_count] @ addressof(indices_addr);
    Material materials[faces_count] @ addressof(material_addr);
   
};

Model models[while(std::mem::read_unsigned($, 16) != 0x00)] @ 0x00;

std::print("done");