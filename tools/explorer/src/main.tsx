import '@babylonjs/loaders/OBJ/objFileLoader';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Culling/ray';
import '@VCRE/core/extensions';
import 'inter-ui/inter.css';

import CssBaseline from '@geist-ui/core/esm/css-baseline/css-baseline';
import GeistProvider from '@geist-ui/core/esm/geist-provider/geist-provider';
import { Explorer, SelectGameDir } from '@VCRE/components';
import { AssetViewer } from '@VCRE/components/viewers';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter,RouterProvider } from 'react-router-dom';

import App from './App.tsx';

const router = createHashRouter([
  {
    path: '/',
    Component: App,
    children: [
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
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeistProvider themeType='dark'>
      <CssBaseline>
        <RouterProvider router={router} />
      </CssBaseline>
    </GeistProvider>
  </React.StrictMode>,
);
