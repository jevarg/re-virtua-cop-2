import './App.css';

import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Page from '@geist-ui/core/esm/page/page';
import PageContent from '@geist-ui/core/esm/page/page-content';
import { Link, Outlet } from 'react-router-dom';

function App() {
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
  </>;
}

export default App;
