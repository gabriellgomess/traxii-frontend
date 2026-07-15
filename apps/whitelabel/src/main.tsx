import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureApi } from '@traxii/shared';
import App from './App';
import './index.css';

configureApi({
  baseUrl:
    window.__APP_CONFIG__?.apiUrl ?? import.meta.env.VITE_API_URL ?? '',
  tokenKey: 'tx_wl_token',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
