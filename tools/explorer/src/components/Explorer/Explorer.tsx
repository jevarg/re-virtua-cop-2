import { Grid } from '@geist-ui/core';
import { FileTree } from '../FileTree/FileTree';
import './Explorer.css';
import { useCallback, useState } from 'react';
import { AssetPack } from '../../core/gamedata/AssetPack';
import { AssetViewer } from '../viewer/AssetViewer';

export function Explorer() {
    const [asset, setAsset] = useState<AssetPack>();
    const onClick = useCallback((asset: AssetPack) => {
        setAsset(asset);
    }, []);

    return <Grid.Container>
        <Grid xs={4}>
            <aside className='sidebar'>
                <FileTree onClick={onClick} />
            </aside>
        </Grid>
        <Grid.Container justify='center' xs={20}>
            <AssetViewer asset={asset} />
        </Grid.Container>
    </Grid.Container>;
}