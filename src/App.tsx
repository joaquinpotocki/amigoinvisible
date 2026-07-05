import { HashRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HostPage />} />
        <Route path="/jugar/:encoded" element={<PlayerPage />} />
      </Routes>
    </HashRouter>
  );
}
