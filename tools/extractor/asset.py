from enum import IntEnum
import os
from pathlib import Path

class AssetType(IntEnum):
    TEXTURE = 0,
    PALETTE = 1,
    MODEL = 2,

class Asset():
    __data: bytes
    __type: AssetType

    def __init__(self, file_path: str) -> None:
        with open(file_path, "rb") as file:
            self.__data = file.read()

            match(os.path.basename(file_path)[:2]):
                case "T_":
                    self.__type = AssetType.TEXTURE
                case "L_":
                    self.__type = AssetType.PALETTE
                case "M_":
                    self.__type = AssetType.MODEL



    def extract_models(self) -> None:
