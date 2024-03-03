import { useCallback, useState } from 'react';
import { Button } from './components/ButtonFix';
import { Explorer } from './components/Explorer/Explorer';
import { ButtonProps, Grid, Page } from '@geist-ui/core';
import { GameData } from './core/gamedata/GameData';

import './App.css';

function SelectGameDir(props: ButtonProps) {
  return <Button {...props} >
    Select game directory
  </Button>;
}

function App() {
  // const mainCtx = useContext(MainContext);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadGameData = useCallback(async () => {
    await GameData.init();
    await GameData.get().build();
    setIsInitialized(true);
  }, []);

  return <>
    <div className='header-wrapper'>
      <header className='header'>
        <Grid.Container justify='center'>
          <Grid xs={18} alignItems='center'>
            <img src='/header.png' className='header-img' />
            <p>VCop2 re</p>
          </Grid>
        </Grid.Container>
      </header>
    </div>
    <Page id='main-section'>
      <Page.Content>
        {isInitialized ? <Explorer /> : <SelectGameDir onClick={loadGameData} />}
      </Page.Content>
    </Page>
  </>;
}

export default App;
