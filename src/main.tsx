import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// /crm — CRM для администраторов (старый адрес /admin тоже открывает её). Грузится отдельным файлом, сайт её не тянет.
const Admin = lazy(() => import('./admin/Admin.tsx'));
const isAdmin = ['/crm', '/admin'].includes(location.pathname.replace(/\/$/, ''));

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
