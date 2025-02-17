import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from '../Css/Register.module.css';
import { LoadingDinamico } from '../../components/LoadingDinamico/LoadingDinamico';

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.VITE_API_URL}/users`, {
        nombre,
        apellidos,
        telefono,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
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
        <div className={`${styles.registerContainer} mt-5 mb-5`}>
          <div className={`${styles.registerBox__registerContainer}`}>
            <header className={`${styles.header__registerBox}`}>
              <h1 className={`${styles.title__header}`}>Multi-Stock-Sync</h1>
              <p>Registrarse</p>
            </header>
            <hr/>
            <form className="form" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  placeholder="Ejemplo: Arthur"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="apellidos" className="form-label">Apellidos</label>
                <input
                  type="text"
                  className="form-control"
                  id="apellidos"
                  placeholder="Ejemplo: Morgan 🤠"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  id="telefono"
                  placeholder="Ejemplo: +56999999999"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Ejemplo: thisismyemail@email.com"
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
              <div className="mb-3">
                <label htmlFor="passwordConfirmation" className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="passwordConfirmation"
                  placeholder="Confirma tu contraseña"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
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