import './App.css';

import { Grid, Page } from '@geist-ui/core';
import { Explorer } from '@VCRE/components';
import { Button } from '@VCRE/components/GeistFix';
import { AssetViewer } from '@VCRE/components/viewers';
import { GameData } from '@VCRE/core/gamedata';
import { useCallback } from 'react';
import { createBrowserRouter, LoaderFunctionArgs, redirect, RouterProvider, useNavigate } from 'react-router-dom';

function SelectGameDir() {
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

SelectGameDir.loader = function(_args: LoaderFunctionArgs) {
  if (!GameData.isInitialized) {
    return null;
  }

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirectTo') || '/';
  return redirect(redirectTo);
};

const router = createBrowserRouter([
  {
    path: '/open',
    Component: SelectGameDir,
    loader: SelectGameDir.loader
  },
  {
    path: '/',
    Component: Explorer,
    loader: ({ request }) => {
      if (!GameData.isInitialized) {
        const url = new URL(request.url);

        let destination = '/open';
        if (url.pathname !== '/') {
          const queryParams = new URLSearchParams();
          queryParams.set('redirectTo', url.pathname);
          destination += `?${queryParams}`;
        }

        return redirect(destination);
      }

      return null;
    },
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
    {/* <BrowserRouter> */}
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
          <RouterProvider router={router} />
        </Page.Content>
      </Page>
  </>;
}

export default App;
