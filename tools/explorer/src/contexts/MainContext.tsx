import { FunctionComponent, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { VC2GameData } from '../gamedata/VC2GameData';
import { showDirectoryPicker } from 'native-file-system-adapter';

export interface MainContextType {
    gameData: VC2GameData;
    isGameDataLoaded: boolean;

    loadGameData: () => Promise<void>;
}

export const MainContext = createContext<MainContextType>({
    gameData: {} as VC2GameData,
    isGameDataLoaded: false,

    loadGameData: async () => {}
});

export const MainContextProvider: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [gameData, setGameData] = useState<VC2GameData>({} as VC2GameData);
    const [isGameDataLoaded, setGameDataLoaded] = useState(false);
    const loadGameData = useCallback(async () => {
        const rootDir = await showDirectoryPicker();
        const vc2GameData = new VC2GameData(rootDir);
        await vc2GameData.build();

        setGameData(vc2GameData);
    }, []);

    useEffect(() => setGameDataLoaded(gameData instanceof VC2GameData), [gameData]);

    const contextValue: MainContextType = {
        gameData,
        isGameDataLoaded,

        loadGameData
    };

    return (
        <MainContext.Provider value={contextValue}>
            {children}
        </MainContext.Provider>
    );
};