import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FixtureGenerator from './pages/FixtureGenerator';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FixtureGenerator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
