import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
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
    }
  };

  return (
    <>
      <div className="d-flex flex-grow-1 main-container">
        <div className="w-50 bg-light p-3 align-items-center justify-content-center">
          <div>
            <div className="login-box">
              <h1>Multi-Stock-Sync</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Ejemplo: multi@stocksync.io"
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
                <Link to="/register" className="d-block text-decoration-none text-success">Registrarse</Link>
                <a href="#" className="d-block text-decoration-none text-danger">¿Olvidaste tu contraseña?</a>
                <div className="help-box bg-light p-3 border">
                  ¿Tienes dudas? <br />
                  <strong>Llámanos al +562 29381115</strong>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="w-50 bg-orange p-3 d-flex align-items-center justify-content-center">

        </div>
      </div>
    </>
  );
};

export default Login;
