#include <std/io.pat>
#include <std/mem.pat>

#define INDICES_PADDING 6
#define VERTICES_PER_FACE 4
#define VERTEX_COMPONENTS_COUNT 3



fn calc_vertices_size(u16 vertices_count) {
    return vertices_count * VERTEX_COMPONENTS_COUNT;
};

struct Index {
    u16 face[4];
    padding[12];
    //u8 unk[12];
};

struct Model {
    float *vertices_addr : u32;
    u16 *indices_addr : u32;
    u8 *off2 : u32;
    u16 vertices_count;
    u8 faces_count;
    u8 unk1;

    float vertices[calc_vertices_size(vertices_count)] @ addressof(vertices_addr);
    Index indices[faces_count] @ addressof(indices_addr);
   
};

Model models[while(std::mem::read_unsigned($, 16) != 0x00)] @ 0x00;

std::print("done");