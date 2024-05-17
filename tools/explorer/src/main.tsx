import '@babylonjs/loaders/OBJ/objFileLoader';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Culling/ray';
import '@VCRE/core/extensions';
import 'inter-ui/inter.css';

import { CssBaseline,GeistProvider } from '@geist-ui/core';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeistProvider themeType='dark'>
      <CssBaseline>
        <App />
      </CssBaseline>
    </GeistProvider>
  </React.StrictMode>,
);
