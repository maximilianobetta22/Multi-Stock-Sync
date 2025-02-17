import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from '../Css/Register.module.css';
import { LoadingDinamico } from '../../components/LoadingDinamico/LoadingDinamico';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/register`, { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/sync/home');
    } catch (err) {
      setError((err as any).response?.data?.message || 'Error en el registro');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div className={`${styles.registerContainer}`}>
          <div className={`${styles.registerBox__registerContainer}`}>
            <header className={`${styles.header__registerBox}`}>
              <h1 className={`${styles.title__header}`}>Multi-Stock-Sync</h1>
              <p>Registrarse</p>
            </header>
            <hr/>
            <form className="form" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Ejemplo: luismiguel@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button type="submit" className="btn btn-primary w-100">Registrarse</button>
              <div className="mt-3">
                <Link to="/sync/login" className="d-block text-decoration-none text-primary text-center">Iniciar Sesión</Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;