import './App.css';

import { Grid, Page } from '@geist-ui/core';
import { Explorer, SelectGameDir } from '@VCRE/components';
import { AssetViewer } from '@VCRE/components/viewers';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
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
        path: '/:assetType/:assetName',
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
        <Grid.Container justify='center'>
          <Grid xs={18} alignItems='center'>
            <img src='/header.png' className='header-img' />
            <p>VCop2 Explorer</p>
          </Grid>
        </Grid.Container>
      </header>
    </div>
    <Page id='main-section'>
      <Page.Content>
        <RouterProvider router={router} />
      </Page.Content>
    </Page>
  </>;
}

export default App;
