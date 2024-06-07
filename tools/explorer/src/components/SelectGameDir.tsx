import './SelectGameDir.css';

import Card from '@geist-ui/core/esm/card/card';
import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Text from '@geist-ui/core/esm/text/text';
import Folder from '@geist-ui/icons/folder';
import { GameData } from '@VCRE/core/gamedata';
import { useCallback } from 'react';
import { LoaderFunctionArgs, redirect, useLocation, useNavigate } from 'react-router-dom';

import { Button } from './GeistFix';

export function SelectGameDir() {
    const location = useLocation();
    const navigate = useNavigate();

    const loadGameData = useCallback(async () => {
        await GameData.init();
        await GameData.get().build();

        const queryParams = new URLSearchParams(location.search);
        const redirectTo = queryParams.get('redirectTo') || '/';

        navigate(redirectTo);
    }, [location.search, navigate]);

    return <>
        <div className='centered'>
            <Card hoverable width={15} onClick={loadGameData} className='card-browse'>
                {/* <Text h2>Open game data</Text> */}
                <Folder size={72} color='#777' className='icon-folder' />
                <Text p small style={{ color: '#777' }} className='help-text'>
                    You must select the folder where the game executable is located
                </Text>
            </Card>
        </div>

        {/* <GridContainer justify='center' direction='column'>
            <Grid width='100%'>
                <Text h2>Open game data</Text>
            </Grid>
            <Grid width='100%'>
                <Button icon={<Folder />} onClick={loadGameData} auto>
                    Select game directory
                </Button>
            </Grid>
        </GridContainer> */}
    </>;
}

SelectGameDir.loader = function (_args: LoaderFunctionArgs) {
    if (!GameData.isInitialized) {
        return null;
    }

    const queryParams = new URLSearchParams(location.search);
    const redirectTo = queryParams.get('redirectTo') || '/';
    return redirect(redirectTo);
};
