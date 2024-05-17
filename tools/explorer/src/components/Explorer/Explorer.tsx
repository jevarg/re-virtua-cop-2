import './Explorer.css';

import { Grid } from '@geist-ui/core';
import { FileTree } from '@VCRE/components';
import { Outlet } from 'react-router-dom';

export function Explorer() {
    return <>
        <Grid.Container>
            <Grid xs={4}>
                <aside className='sidebar'>
                    <FileTree />
                </aside>
            </Grid>
            <Grid.Container justify='center' xs={20}>
                <Outlet />
            </Grid.Container>
        </Grid.Container>
    </>;
}