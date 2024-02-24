import { Tree } from '@geist-ui/core';
import { useCallback, useContext, useMemo } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { TreeFile } from '@geist-ui/core/esm/tree';
import { TreeNode, TreeNodeType } from '../../core/gamedata/FSTree';
import { TextureFileName, TexturesFile } from '../../core/gamedata/Textures/TexturesFile';
import { Texture } from '../../core/gamedata/Textures/Texture';
import { AssetType } from '../../core/gamedata/PackedAssetsFile';

export type ClickedTexture = {
    texture: Texture
}

export interface FileTreeProps {
    onClick: (item: TexturesFile) => void;
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
        console.log(list);

        return buildTree(list);
    }, [mainCtx.gameData]);

    const onTreeClicked = useCallback((path: string) => {
        const [assetType, assetFileType] = path.split('/');
        if (!assetType || !assetFileType) {
            console.warn('Invalid file was clicked:', path);
            return;
        }

        const textureFile = mainCtx.gameData.assets?.[assetType as AssetType].get(assetFileType as TextureFileName);
        if (!textureFile) {
            console.warn(`Unable to find ${assetFileType} in game data`);
            return;
        }
        // const texture = textureFile?.getTexture(Number(textureId));

        onClick(textureFile);
    }, [mainCtx.gameData.assets, onClick]);


    return (
        <Tree className='file-tree' value={tree} onClick={onTreeClicked} />
    );
}