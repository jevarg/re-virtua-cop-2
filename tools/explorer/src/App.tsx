import './App.css';

import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Page from '@geist-ui/core/esm/page/page';
import PageContent from '@geist-ui/core/esm/page/page-content';
import { Explorer, SelectGameDir } from '@VCRE/components';
import { AssetViewer } from '@VCRE/components/viewers';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  {
    path: '/open',
    Component: SelectGameDir,
    loader: SelectGameDir.loader
  },
  {
    path: '/',
    Component: Explorer,
    loader: Explorer.loader,
    children: [
      {
        path: '/:assetType/:assetFileName',
        Component: AssetViewer,
        loader: AssetViewer.loader
      },
      {
        path: '/:assetType/:assetFileName/:assetId',
        Component: AssetViewer,
        loader: AssetViewer.loader
      }
    ]
  }
]);

function App() {
  return <>
    <div className='header-wrapper'>
      <header className='header'>
        <GridContainer justify='center'>
          <Grid xs={18} alignItems='center'>
            <img src='header.png' className='header-img' />
            <p>VCop2 Explorer</p>
          </Grid>
        </GridContainer>
      </header>
    </div>
    <Page id='main-section'>
      <PageContent>
        <RouterProvider router={router} />
      </PageContent>
    </Page>
  </>;
}

export default App;
