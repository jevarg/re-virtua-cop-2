
export enum TreeNodeType {
    Directory = 'directory',
    File = 'file',
}

type NamedNode = {
    name: string
    type: TreeNodeType
}

export type FileNode = NamedNode & {
    type: TreeNodeType.File
}

export type DirNode = NamedNode & {
    type: TreeNodeType.Directory
    children: TreeNode[]
}

export type TreeNode = FileNode | DirNode;
