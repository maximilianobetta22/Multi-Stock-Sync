import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Changed import

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.tsx'
import "antd/dist/reset.css"; // Importante: CSS base de Ant Design

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* Changed HashRouter to BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
