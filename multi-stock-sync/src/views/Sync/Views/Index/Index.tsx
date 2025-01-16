import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Index.module.css';  // Importamos los estilos

const Index = () => {
  const [setData] = useState<any>(null);  // Datos de la API
  const navigate = useNavigate();  // Hook para redireccionar

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('tu-api-endpoint');
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>Bienvenido a Multi Stock Sync</h1>
        <nav>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/productos">Productos</a></li>
            <li><a href="/acerca">Acerca de</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </nav>
      </header>

      <div className={styles.mainContent}>
        <section className={styles.cards}>
          <h2>Características</h2>

          <div className={styles.cardContainer}>
            {/* Card 1 */}
            <div className={styles.card}>
              <img src="https://via.placeholder.com/150" alt="Imagen 1" className={styles.cardImage} />
              <h3>Tienda 1</h3>
              <p>Descripción...</p>
              <button onClick={() => navigate('/producto/1')} className={styles.cardButton}>
                Ir a tienda...
              </button>
            </div>

            {/* Card 2 */}
            <div className={styles.card}>
              <img src="https://via.placeholder.com/150" alt="Imagen 2" className={styles.cardImage} />
              <h3>Tienda 2</h3>
              <p>Descripción...</p>
              <button onClick={() => navigate('/producto/2')} className={styles.cardButton}>
              Ir a tienda...
              </button>
            </div>

            {/* Card 3 */}
            <div className={styles.card}>
              <img src="https://via.placeholder.com/150" alt="Imagen 3" className={styles.cardImage} />
              <h3>Tienda 3</h3>
              <p>Descripción...</p>
              <button onClick={() => navigate('/producto/3')} className={styles.cardButton}>
              Ir a tienda...
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2025 Multi Stock Sync. Todos los derechos reservados.</p>
        
      </footer>
    </div>
  );
};

export default Index;
