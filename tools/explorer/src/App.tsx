import './App.css';

import { Spacer } from '@geist-ui/core';
import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Image from '@geist-ui/core/esm/image/image';
import Page from '@geist-ui/core/esm/page/page';
import PageContent from '@geist-ui/core/esm/page/page-content';
import Toggle from '@geist-ui/core/esm/toggle/toggle';
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { settings } from './core/Settings';

const cursorClass = 'animated-cursor';

function App() {
  const [isCursorCustom, setIsCursorCustom] = useState(settings.customCursor);

  useEffect(() => {
    if (isCursorCustom) {
      document.body.classList.add(cursorClass);
    } else {
      document.body.classList.remove(cursorClass);
    }
  }, [isCursorCustom]);

  const onCursorSettingChanged = useCallback(() => {
    settings.customCursor = !isCursorCustom;
    settings.save();

    setIsCursorCustom(!isCursorCustom);
  }, [isCursorCustom]);

  return <>
    <div className='header-wrapper'>
      <header className='header'>
        <GridContainer justify='center'>
        <Grid xs={18} alignItems='center'>
            <Link to="/" className='header-link'>
              <img src='header.png' className='header-img' />
              <p>VCop2 Explorer</p>
            </Link>
          </Grid>
        </GridContainer>
      </header>
    </div>
    <Page id='main-section'>
      <PageContent>
        <Outlet />
      </PageContent>
    </Page>
    <div className='cursor-settings'>
      <Image className={`cursor-image ${isCursorCustom || 'bw'}`} src='cursor/5.png' />
      <Spacer w={1} />
      <Toggle className='cursor-toggle' onChange={onCursorSettingChanged} checked={isCursorCustom} />
    </div>
  </>;
}

export default App;
