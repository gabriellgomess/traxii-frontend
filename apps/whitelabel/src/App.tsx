import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { BrandProvider } from './contexts/BrandContext';
import { AppLayout } from './layouts/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Home } from './pages/app/Home';
import { Pix } from './pages/app/Pix';
import { Ted } from './pages/app/Ted';
import { Extrato } from './pages/app/Extrato';
import { Dados } from './pages/app/Dados';
import { Ajuda } from './pages/app/Ajuda';

export default function App() {
  return (
    <BrowserRouter>
      <BrandProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="pix" element={<Pix />} />
              <Route path="ted" element={<Ted />} />
              <Route path="extrato" element={<Extrato />} />
              <Route path="dados" element={<Dados />} />
              <Route path="ajuda" element={<Ajuda />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrandProvider>
    </BrowserRouter>
  );
}
