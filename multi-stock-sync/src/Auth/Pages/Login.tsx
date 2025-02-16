import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from '../Css/Login.module.css';

export const Login: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
      console.log(err)
    }
  };

  return (
    <>
      <div className={`${styles.loginContainer}`}>
        <div className={`${styles.loginBox__loginContainer}`}>
          <header className={`${styles.header__loginBox}`}>
            <h1 className={`${styles.title__header}`}>Multi-Stock-Sync</h1>
            <p>Iniciar sesión</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
            <div className="mt-3">
              <Link to="/register" className="d-block text-decoration-none text-primary text-center">Registrarse</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
