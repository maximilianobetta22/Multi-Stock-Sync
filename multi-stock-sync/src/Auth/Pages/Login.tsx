import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../Css/Login.module.css';
import { LoadingDinamico } from '../../components/LoadingDinamico/LoadingDinamico';
import { UserContext } from '../../Sync/Context/UserContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('UserContext must be used within a UserProvider');
  }

  const { setUser } = userContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/login`, {
        email,
        password,
      });

      const userData = response.data.user;

      // Verificar que role_id exista
      if (userData.role_id === null || userData.role_id === undefined) {
        setError('Este usuario aún no tiene un rol asignado. Contacte al administrador.');
        setLoading(false);
        return;
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Actualizar contexto
      setUser(userData);

      navigate('/sync/seleccionar-conexion');
    } catch (err) {
      console.log(err);
      setError((err as any).response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingDinamico variant="container" />}
      {!loading && (
        <div className={styles.loginContainer}>
          <div className={styles.loginBox__loginContainer}>
            <header className={styles.header__loginBox}>
              <h1 className={styles.title__header}>Multi-Stock-Sync</h1>
              <p>Iniciar sesión</p>
            </header>
            <hr />
            <form className="form" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Ejemplo: usuario@email.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    placeholder="Tu contraseña"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button type="submit" className="btn btn-primary w-100">
                Iniciar Sesión
              </button>

              <div className="mt-3">
                <Link to="/sync/register" className="d-block text-decoration-none text-primary text-center">
                  Registrarse
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
