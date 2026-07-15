import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureApi } from '@traxii/shared';
import App from './App';
import './index.css';

configureApi({
  baseUrl: import.meta.env.VITE_API_URL ?? '',
  tokenKey: 'tx_admin_token',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
