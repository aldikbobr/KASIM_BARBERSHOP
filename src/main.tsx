import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// /admin — CRM для администраторов. Грузится отдельным файлом, сайт её не тянет.
const Admin = lazy(() => import('./admin/Admin.tsx'));
const isAdmin = location.pathname.replace(/\/$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
