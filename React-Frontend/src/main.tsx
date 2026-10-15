import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {Toaster} from 'sonner';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <Toaster position="top-right" richColors />
    </StrictMode>,
);
