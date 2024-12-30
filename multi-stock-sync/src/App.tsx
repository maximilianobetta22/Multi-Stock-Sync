import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
