import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from './App.jsx'
import InfoPage from './pages/InfoPage'
import AdminPage from './pages/AdminPage'


function BodyClassManager() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.remove('map-page', 'admin-page', 'info-page');
    
    if (location.pathname === '/admin') {
      document.body.classList.add('admin-page');
    } else if (location.pathname === '/info') {
      document.body.classList.add('info-page');
    } else {
      document.body.classList.add('map-page');
    }
  }, [location]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BodyClassManager />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)