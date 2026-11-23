import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="app-root">
      {!isAdminPath && <Navbar />}
      <main className="app-main-content">
        <AppRoutes />
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
