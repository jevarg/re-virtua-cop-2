import { FunctionComponent, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { VC2GameData } from '../core/gamedata/VC2GameData';
import { showDirectoryPicker } from 'native-file-system-adapter';
import { Texture } from '../core/gamedata/Textures/Texture';

export interface MainContextType {
    gameData: VC2GameData;
    isGameDataLoaded: boolean;

    selectedTexture?: Texture;
    setSelectedTexture: (texture: Texture) => void;

    loadGameData: () => Promise<void>;
}

export const MainContext = createContext<MainContextType>({
    gameData: {} as VC2GameData,
    isGameDataLoaded: false,

    selectedTexture: undefined,
    setSelectedTexture: () => {},

    loadGameData: async () => {}
});

export const MainContextProvider: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [gameData, setGameData] = useState<VC2GameData>({} as VC2GameData);
    const [isGameDataLoaded, setGameDataLoaded] = useState(false);
    const [selectedTexture, setSelectedTexture] = useState<Texture>();

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

        selectedTexture,
        setSelectedTexture,

        loadGameData
    };

    return (
        <MainContext.Provider value={contextValue}>
            {children}
        </MainContext.Provider>
    );
};