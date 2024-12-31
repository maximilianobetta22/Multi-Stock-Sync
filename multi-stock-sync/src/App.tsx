import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';
import Despacho from './views/PuntoVenta/Dashboard/Despacho/Despacho';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
        <Route path="/despacho" element={<Despacho />} />

      </Routes>
    </Router>
  );
}

export default App;
