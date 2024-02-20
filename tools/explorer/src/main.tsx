import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import { MainContextProvider } from './contexts/MainContext.tsx';
import './core/extensions';
import 'inter-ui/inter.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <GeistProvider themeType='dark'>
      <CssBaseline>
        <MainContextProvider>
          <App />
        </MainContextProvider>
      </CssBaseline>
    </GeistProvider>
  // </React.StrictMode>,
);
