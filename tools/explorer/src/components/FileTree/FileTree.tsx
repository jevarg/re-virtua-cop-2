import { Tree } from '@geist-ui/core';
import { useCallback, useMemo } from 'react';
import { TreeFile } from '@geist-ui/core/esm/tree';
import { TreeNode, TreeNodeType } from '../../core/gamedata/FSTree';
import { TextureFileName } from '../../core/gamedata/Textures/TexturePack';
import { Texture } from '../../core/gamedata/Textures/Texture';
import { AssetType, AssetPack } from '../../core/gamedata/AssetPack';
import { ModelFileName } from '../../core/gamedata/Models/ModelPack';
import { GameData } from '../../core/gamedata/GameData';

export type ClickedTexture = {
    texture: Texture
}

export interface FileTreeProps {
    onClick: (item: AssetPack) => void;
}

export function FileTree({ onClick }: FileTreeProps) {
    const gameData = GameData.get();

    const tree = useMemo(() => {
        const buildTree = (nodes: TreeNode[]) => {
            const tree: TreeFile[] = [];

            for (const node of nodes) {
                const newNode: TreeFile = {
                    name: node.name,
                    type: node.type,
                    extra: node.extra,
                    files: []
                };

                if (node.type === TreeNodeType.Directory) {
                    newNode.files = buildTree(node.children);
                    newNode.extra = node.extra;
                }

                tree.push(newNode);
            }

            return tree;
        };

        const list = gameData.getFileStructure();

        return buildTree(list);
    }, []);

    const onTreeClicked = useCallback((path: string) => {
        if (!gameData.assets) {
            return;
        }

        const strings = path.split('/');
        const assetType = strings[0] as AssetType;
        const assetFileName = strings[1] as TextureFileName | ModelFileName;

        if (!assetType || !assetFileName) {
            console.warn('Invalid file was clicked:', path);
            return;
        }

        const asset = gameData.assets[assetType].get(assetFileName as never);
        if (!asset) {
            console.warn(`Unable to find ${assetFileName} in game data`);
            return;
        }

        onClick(asset);
    }, [onClick]);


    return (
        <Tree className='file-tree' value={tree} onClick={onTreeClicked} />
    );
}