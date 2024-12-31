import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitialPage from './views/InitialPage';
import PuntoVentaDashboard from './views/PuntoVenta/Dashboard/PuntoVentaDashboard';
import Despacho from './views/PuntoVenta/Dashboard/Despacho/Despacho';
import Reimprimir from './views/PuntoVenta/Dashboard/Reimprimir/Reimprimir';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/punto-venta" element={<PuntoVentaDashboard />} />
        <Route path="/punto-venta/despacho" element={<Despacho />} />
        <Route path="/punto-venta/reimprimir" element={<Reimprimir />} />
      </Routes>
    </Router>
  );
}

export default App;
