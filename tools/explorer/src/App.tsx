import { useContext, useEffect } from 'react';
import { MainContext } from './contexts/MainContext';
import { Button } from './components/ButtonFix';
import { Explorer } from './components/Explorer/Explorer';
import { ButtonProps, Grid, Page } from '@geist-ui/core';
import './App.css';

function SelectGameDir(props: ButtonProps) {
  return <Button {...props} >
    Select game directory
  </Button>;
}

function App() {
  const mainCtx = useContext(MainContext);

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
        {mainCtx.isGameDataLoaded ? <Explorer /> : <SelectGameDir onClick={mainCtx.loadGameData} />}
      </Page.Content>
    </Page>
  </>;
}

export default App;
