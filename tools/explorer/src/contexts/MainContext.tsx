import { FunctionComponent, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { GameData } from '../core/gamedata/GameData';
import { Texture } from '../core/gamedata/Textures/Texture';

export interface MainContextType {
    gameData: GameData;
    isGameDataLoaded: boolean;

    selectedTexture?: Texture;
    setSelectedTexture: (texture: Texture) => void;

    loadGameData: () => Promise<void>;
}

export const MainContext = createContext<MainContextType>({
    gameData: {} as GameData,
    isGameDataLoaded: false,

    selectedTexture: undefined,
    setSelectedTexture: () => {},

    loadGameData: async () => {}
});

export const MainContextProvider: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [gameData, setGameData] = useState<GameData>({} as GameData);
    const [isGameDataLoaded, setGameDataLoaded] = useState(false);
    const [selectedTexture, setSelectedTexture] = useState<Texture>();

    const loadGameData = useCallback(async () => {
        // const rootDir = await showDirectoryPicker();
        // GameData.init(rootDir);
        // GameData.get().build();

        // setGameData(vc2GameData);
    }, []);

    useEffect(() => setGameDataLoaded(gameData instanceof GameData), [gameData]);

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