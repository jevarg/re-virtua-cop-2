from enum import IntEnum, auto, unique

@unique
class TextureType(IntEnum):
    T_COMMON = 0
    T_STG1C = auto()
    T_STG10 = auto()
    T_STG11 = auto()
    T_STG12 = auto()
    T_OPTION = auto()
    T_SELECT = auto()
    T_STG2C = auto()
    T_STG20 = auto()
    T_STG21 = auto()
    T_STG22 = auto()
    T_STG3C = auto()
    T_STG30 = auto()
    T_STG31 = auto()
    T_STG32 = auto()
    T_FANG = auto()
    T_ADV = auto()
    T_NAME = auto()
    T_LOGO = auto()
    T_TITLE = auto()
    T_MINI_C = auto()
    T_RANK = auto()
