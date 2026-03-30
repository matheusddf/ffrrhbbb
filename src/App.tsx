import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientPage from './pages/ClientPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/:storeSlug" element={<ClientPage />} />
        <Route path="/" element={<div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-500">Selecione uma loja ou faça login.</div>} />
      </Routes>
    </Router>
  );
}
