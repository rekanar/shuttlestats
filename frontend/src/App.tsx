import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FixtureGenerator from './pages/FixtureGenerator';
import Championships from './pages/Championships';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FixtureGenerator />} />
        <Route path="/championships" element={<Championships />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
