import os
import sys

from model.textures import TextureType
from ppj2dd import PPJ2DD
from context import Context

def usage():
    print(f"usage: {sys.argv[0]} <PPJ2DD.EXE> [out_dir]")
    return 1

def main():
    args_count = len(sys.argv)
    if args_count < 2:
        return usage()

    exe_path = sys.argv[1]

    if args_count > 2:
        Context.out_dir = os.path.abspath(sys.argv[2])
    else:
        Context.out_dir = os.path.abspath('.')

    Context.root_dir = os.path.abspath(os.path.dirname(exe_path))
    Context.bin_dir = os.path.join(Context.root_dir, 'BIN')

    assets = PPJ2DD(exe_path)

    # with open(res_path, "rb") as file:
    #     data = file.read()
    #     models.extract(data, out_dir)

if __name__ == "__main__":
    main()
