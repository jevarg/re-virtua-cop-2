import std.mem;
import std.io;
import type.magic;
import type.size;

#define HEADER_BYTE_SIZE 12
#define SOUND_DEF_BYTE_SIZE 40

u32 start = 0;
u32 offset = 0;

struct Header {
    type::Magic<"WVP\0"> magic;
    u32 count;
    u32;
};

struct Sound {
    u32 id;
    padding[4];
    u32 sampleRate1;
    u32 sampleRate2;
    padding[2];
    u16 bitDepth;
    padding[4];
    type::Size<u32> size;
    u8 loop;
    padding[11];

    u8 raw[size] @ HEADER_BYTE_SIZE + SOUND_DEF_BYTE_SIZE * header.count + offset;
    offset += size;

    std::print("[{}] from {} to {} ({} bytes)", id, addressof(raw), addressof(raw) + size, size);
} [[hex::visualize("sound", raw, 1, sampleRate1)]];

Header header @ 0x00;
Sound sounds[header.count] @ $;

u32 final_offset = SOUND_DEF_BYTE_SIZE * header.count + HEADER_BYTE_SIZE + offset;
if (final_offset != std::mem::size()) {
    std::error(std::format("{:02X} != {:02X}", final_offset, std::mem::size()));
}
