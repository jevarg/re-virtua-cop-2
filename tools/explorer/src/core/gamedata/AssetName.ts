import { ModelPackName } from './Models/ModelPack';
import { PaletteFileName } from './Textures/PaletteFile';
import { TexturePackName } from './Textures/TexturePack';

export type AssetName = ModelPackName & TexturePackName & PaletteFileName;
