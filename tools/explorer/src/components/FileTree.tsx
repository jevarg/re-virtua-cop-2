import { Tree } from '@geist-ui/core';
import { useContext, useMemo } from 'react';
import { MainContext } from '../contexts/MainContext';
import { TreeFile } from '@geist-ui/core/esm/tree';
import { TreeNodeType } from '../gamedata/FSTree';

export function FileTree() {
    const mainCtx = useContext(MainContext);

    const tree = useMemo(() => {
        const tree: TreeFile[] = [];
        const list = mainCtx.gameData.buildFileTree();

        for (const node of list) {
            if (node.type === TreeNodeType.Directory) {
                const folder: TreeFile = {
                    name: node.name,
                    type: node.type,
                    extra: `${node.children.length} file(s)`,
                    files: []
                };

                // This works because we only have 1 level of depth.
                // It could be recursive but balek.
                for (const file of node.children) {
                    folder.files?.push({
                        name: file.name,
                        type: file.type,
                    });
                }

                tree.push(folder);
            } else {
                tree.push({
                    name: node.name,
                    type: node.type,
                });
            }
        }

        return tree;
    }, [mainCtx.gameData]);

    return (
        <Tree value={tree}  />
    );
}