import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from './Register.module.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${process.env.VITE_API_URL}/users`, {
        nombre,
        apellidos,
        telefono,
        email,
        nombre_negocio: nombreNegocio,
        password,
        password_confirmation: passwordConfirmation
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/'); // Redirect to home or dashboard
    } catch (error) {
      setError('Registration failed');
      console.log(error)
    }
  };

  return (
    <>
      <div className={`${styles.registerContainer}`}>
        <div className={`${styles.registerBox}`}>
          <header className={`${styles.header__registerBox}`}>
            <h1 className={`${styles.title__header}`}>Multi-Stock-Sync</h1>
          </header>
          <hr/>
          <form className={`${styles.formContainer}`} onSubmit={handleSubmit}>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input
                className={`form-control`}
                type="text"
                id="nombre"
                placeholder="Ejemplo: Marcos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="apellidos" className="form-label">Apellidos</label>
              <input
              className={`form-control`}
                type="text"
                id="apellidos"
                placeholder="Ejemplo: Reyes"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input
              className={`form-control`}
                type="text"
                id="telefono"
                placeholder="Ejemplo: +56950369308"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="nombreNegocio" className="form-label">Nombre del Negocio</label>
              <input
              className={`form-control`}
                type="text"
                id="nombreNegocio"
                placeholder="Ejemplo: Marcos Reyes Negocio"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="username" className="form-label">Nombre de Usuario</label>
              <input
              className={`form-control`}
                type="text"
                id="username"
                placeholder="Ejemplo: multi@stocksync.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
              className={`form-control`}
                type="password"
                id="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="passwordConfirmation" className="form-label">Confirmar Contraseña</label>
              <input
              className={`form-control ${styles.input__formContainer}`}
                type="password"
                id="passwordConfirmation"
                placeholder="Confirma tu contraseña"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button 
              className={`${styles.btn__formContainer}`}
              type="submit">
              Registrarse
            </button>
            <div className={`${styles.footer__formContainer}`}>
              <p>¿Ya tienes una cuenta?</p>  
              <Link to="/login" >
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
