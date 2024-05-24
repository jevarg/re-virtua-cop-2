import Tree, { TreeFile } from '@geist-ui/core/esm/tree/tree';
import { AssetName, AssetType, GameData, Texture, TreeNode, TreeNodeType } from '@VCRE/core/gamedata';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type ClickedTexture = {
    texture: Texture
}

export function FileTree() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // TODO: Highlight active asset in tree
    }, [location]);

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

        const list = GameData.get().getFileStructure();
        return buildTree(list);
    }, []);

    const onTreeClicked = useCallback((path: string) => {
        const strings = path.split('/');
        const assetType = strings[0] as AssetType;
        const assetFileName = strings[1] as AssetName;

        if (!assetType || !assetFileName) {
            console.warn('Invalid file was clicked:', path);
            return;
        }

        navigate(`/${assetType}/${assetFileName}`);
    }, [navigate]);


    return (
        <Tree className='file-tree' value={tree} onClick={onTreeClicked} />
    );
}