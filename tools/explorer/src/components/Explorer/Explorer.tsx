import { Grid } from '@geist-ui/core';
import { FileTree } from '../FileTree/FileTree';
import './Explorer.css';
import { useCallback, useState } from 'react';
import { PackedAssetsFile } from '../../core/gamedata/PackedAssetsFile';
import { AssetViewer } from '../viewer/AssetViewer';

export function Explorer() {
    const [asset, setAsset] = useState<PackedAssetsFile>();
    const onClick = useCallback((asset: PackedAssetsFile) => {
        setAsset(asset);
    }, []);

    return <Grid.Container>
        <Grid xs={6}>
            <aside className='sidebar'>
                <FileTree onClick={onClick} />
            </aside>
        </Grid>
        <Grid.Container justify='center' xs={18}>
            <AssetViewer asset={asset} />
        </Grid.Container>
    </Grid.Container>;
}