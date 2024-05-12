#include <std/io.pat>

#define RDATA_SECTION_ADDR 0x0004D400
#define VDATA_SECTION_ADDR 0x0044F000
#define RAW_RELATIVE_OFF (0x0004D400 - 0x0044F000)

fn rawAddr(u32 virtualAddr) {
    return virtualAddr + RAW_RELATIVE_OFF;
};

fn virtualAddr(u32 rawAddr) {
    return rawAddr - RAW_RELATIVE_OFF;
};

fn ptrToRaw(u32 virtualAddr) {
    return RAW_RELATIVE_OFF;
};

bitfield TextureFlags {
    padding : 1;
    alpha : 1;
    ui : 1;
    padding : 24;
};

struct Texture {
    u16 width;
    u16 height;
    
    u32 paletteOffset;

    u32 unk0;
    
    TextureFlags flags;
};

struct TextureFile {
    char *fileName[16] : u32 [[pointer_base("ptrToRaw")]];
    char *paletteFileName[16] : u32 [[pointer_base("ptrToRaw")]];
    u32 ptrTextures [[transform("rawAddr")]];
    u8 offset;
    u8 id;
    padding[2];
    u32 *count : u32 [[export, pointer_base("ptrToRaw")]];
    u32 unknown1;

    Texture textures[count] @ ptrTextures;
} [[name(fileName)]];

struct ModelFile {
    char name[16];
    u32 *ptr : u32 [[pointer_base("ptrToRaw")]];
};

enum MOT : u8 {
    MOTCMN = 0,
    MOTSTG1,
    MOTSTG2,
    MOTSTG3,
    MOTFAED,
    MOTADV,
    MOTINT,
    
    MAX
};

enum MODEL : u8 {
    P_COMMON = 0,
    P_STG1C,
    P_STG10,
    P_STG11,
    P_STG12,
    P_OPTION,
    P_SEL,
    P_STG2C,
    P_STG20,
    P_STG21,
    P_STG22,
    P_STG3C,
    P_STG30,
    P_STG31,
    P_STG32,
    P_FANG,
    P_ADV,
    P_NAME,
    P_MINI_C,

    MAX
};

enum TEXTURE : u8 {
    T_COMMON = 0,
    T_STG1C,
    T_STG10,
    T_STG11,
    T_STG12,
    T_OPTION,
    T_SELECT,
    T_STG2C,
    T_STG20,
    T_STG21,
    T_STG22,
    T_STG3C,
    T_STG30,
    T_STG31,
    T_STG32,
    T_FANG,
    T_ADV,
    T_NAME,
    T_LOGO,
    T_TITLE,
    T_MINI_C,
    T_RANK,

    MAX
};

enum PALETTE : u8 {
    L_COMMON = 0,
    L_STG1C,
    L_STG10,
    L_STG11,
    L_STG12,
    L_OPTION,
    L_SELECT,
    L_STG2C,
    L_STG20,
    L_STG21,
    L_STG22,
    L_STG3C,
    L_STG30,
    L_STG31,
    L_STG32,
    L_FANG,
    L_ADV,
    L_NAME,
    L_LOGO,
    L_TITLE,
    L_MINI_C,
    L_RANK,

    MAX
};

enum CAMMOV : u8 {
    CAMMOV0 = 0,
    CAMMOV2,
    CAMMOV1,
    CAMMOV3,

    MAX
};

enum SCENE : u8 {
    SCENE10 = 0,
    SCENE11,
    SCENE12,
    SCENE20,
    SCENE21,
    SCENE22,
    SCENE30,
    SCENE31,
    SCENE32,
    SCENEFA,
    SCENEAD,

    MAX
};

TextureFile textures[22] @ rawAddr(0x00458FD0);

std::print("There are {} MOTS", MOT::MAX);
std::print("There are {} MODELS", MODEL::MAX);
std::print("There are {} TEXTURES", TEXTURE::MAX);
std::print("There are {} PALETTES", PALETTE::MAX);
std::print("There are {} CAMMOVS", CAMMOV::MAX);
std::print("There are {} SCENES", SCENE::MAX);

//File MOT_FILES[MOT::MAX] @ MOT_FILES_ADDR;
ModelFile models[MODEL::MAX] @ rawAddr(0x00472ef8);
//File TEXTURES_FILES[TEXTURE::MAX] @ TEXTURES_FILES_ADDR;
//File PALETTES_FILES[PALETTE::MAX] @ PALETTES_FILES_ADDR;
//File CAMMOV_FILES[CAMMOV::MAX] @ CAMMOV_FILES_ADDR;
//File SCENES_FILES[SCENE::MAX] @ SCENES_FILES_ADDR;