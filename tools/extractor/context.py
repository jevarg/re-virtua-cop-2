
from dataclasses import dataclass

@dataclass
class Context():
    root_dir: str = None
    bin_dir: str = None
    out_dir: str = '.'