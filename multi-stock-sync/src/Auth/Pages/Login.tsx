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
      navigate('/'); // Redirect to home or dashboard
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
          </header>
          <hr/>
          <form className={`${styles.form__loginContainer}`} onSubmit={handleSubmit}>
            <div className={`${styles.formGroup__loginContainer}`}>
              <label 
                htmlFor="username" 
                className="form-label"
              >
                  Nombre de Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Ejemplo: multi@stocksync.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={`${styles.formGroup__loginContainer}`}>
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
            <button 
              type="submit" 
              className={`btn btn-primary w-100 ${styles.btn__loginContainer}`}
            >
              Iniciar Sesión
            </button>
            <div>
              <p>¿No tienes una cuenta?</p>
              <Link 
                to="/register" 
                className="d-block text-decoration-none text-primary"
              >
                Registrarse
              </Link>
            </div>
            <div className="help-box bg-light p-3 border">
              ¿Tienes dudas? <br />
              <strong>Llámanos al +562 29381115</strong>
            </div>
            
            <a href="#" className="d-block text-decoration-none text-danger">
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>
      </div>
    </>
  );
};
