import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initApiFallback } from './lib/apiFallback.ts';

// Ensure full compatibility with Netlify static, serverless functions, and local development
initApiFallback();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

