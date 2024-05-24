import './Explorer.css';

import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import { FileTree } from '@VCRE/components';
import { GameData } from '@VCRE/core/gamedata';
import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';

export function Explorer() {
    return <>
        <GridContainer>
            <Grid xs={4}>
                <aside className='sidebar'>
                    <FileTree />
                </aside>
            </Grid>
            <GridContainer justify='center' xs={20}>
                <Outlet />
            </GridContainer>
        </GridContainer>
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
