import { GameData } from '@VCRE/core/gamedata';
import { useCallback } from 'react';
import { LoaderFunctionArgs, redirect, useNavigate } from 'react-router-dom';

import { Button } from './GeistFix';

export function SelectGameDir() {
    const navigate = useNavigate();

    const loadGameData = useCallback(async () => {
        await GameData.init();
        await GameData.get().build();

        const queryParams = new URLSearchParams(location.search);
        const redirectTo = queryParams.get('redirectTo') || '/';

        navigate(redirectTo);
    }, [navigate]);

    return <Button onClick={loadGameData}>
        Select game directory
    </Button>;
}

SelectGameDir.loader = function (_args: LoaderFunctionArgs) {
    if (!GameData.isInitialized) {
        return null;
    }

    const queryParams = new URLSearchParams(location.search);
    const redirectTo = queryParams.get('redirectTo') || '/';
    return redirect(redirectTo);
};
