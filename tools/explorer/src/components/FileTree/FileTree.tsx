import { Tree } from '@geist-ui/core';
import { useCallback, useContext, useMemo } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { TreeFile } from '@geist-ui/core/esm/tree';
import { TreeNode, TreeNodeType } from '../../core/gamedata/FSTree';
import { TextureFileName } from '../../core/gamedata/Textures/TexturesFile';
import { Texture } from '../../core/gamedata/Textures/Texture';
import { AssetType, PackedAssetsFile } from '../../core/gamedata/PackedAssetsFile';
import { ModelFileName } from '../../core/gamedata/Models/ModelsFile';

export type ClickedTexture = {
    texture: Texture
}

export interface FileTreeProps {
    onClick: (item: PackedAssetsFile) => void;
}

export function FileTree({ onClick }: FileTreeProps) {
    const mainCtx = useContext(MainContext);

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

        const list = mainCtx.gameData.getFileStructure();

        return buildTree(list);
    }, [mainCtx.gameData]);

    const onTreeClicked = useCallback((path: string) => {
        if (!mainCtx.gameData.assets) {
            return;
        }

        const strings = path.split('/');
        const assetType = strings[0] as AssetType;
        const assetFileName = strings[1] as TextureFileName | ModelFileName;

        if (!assetType || !assetFileName) {
            console.warn('Invalid file was clicked:', path);
            return;
        }

        const asset = mainCtx.gameData.assets[assetType].get(assetFileName as never);
        if (!asset) {
            console.warn(`Unable to find ${assetFileName} in game data`);
            return;
        }

        onClick(asset);
    }, [mainCtx.gameData.assets, onClick]);


    return (
        <Tree className='file-tree' value={tree} onClick={onTreeClicked} />
    );
}