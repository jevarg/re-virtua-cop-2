import { Tree } from '@geist-ui/core';
import { useCallback, useContext, useMemo } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { TreeFile } from '@geist-ui/core/esm/tree';
import { TreeNode, TreeNodeType } from '../../core/gamedata/FSTree';
import { TextureFileType } from '../../core/gamedata/Textures/TexturesFile';
import { Texture } from '../../core/gamedata/Textures/Texture';

export type ClickedTexture = {
    texture: Texture
}

export interface FileTreeProps {
    onClick: (item: Texture) => void;
}

export function FileTree({ onClick }: FileTreeProps) {
    const mainCtx = useContext(MainContext);
    console.log('tree update');

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
        const [assetType, textureFileType, textureId] = path.split('/');
        if (!assetType || !textureFileType || !textureId) {
            console.warn('Invalid file was clicked:', path);
            return;
        }

        const textureFile = mainCtx.gameData.textureFiles.get(textureFileType as TextureFileType);
        const texture = textureFile?.getTexture(Number(textureId));
        if (!texture) {
            console.warn(`Unable to find texture ${textureId} in ${textureFileType}`);
            return;
        }

        onClick(texture);
    }, [mainCtx.gameData.textureFiles, onClick]);


    return (
        <Tree className='file-tree' value={tree} onClick={onTreeClicked} />
    );
}