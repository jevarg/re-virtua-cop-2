import './Explorer.css';

import { Grid } from '@geist-ui/core';
import { FileTree } from '@VCRE/components';
import { GameData } from '@VCRE/core/gamedata';
import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';

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

Explorer.loader = ({ request }: LoaderFunctionArgs) => {
    if (!GameData.isInitialized) {
        const url = new URL(request.url);

        let destination = '/open';
        if (url.pathname !== '/') {
            const queryParams = new URLSearchParams();
            queryParams.set('redirectTo', url.pathname);
            destination += `?${queryParams}`;
        }

        return redirect(destination);
    }

    return null;
};
