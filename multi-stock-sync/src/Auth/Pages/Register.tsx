import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from '../Css/Register.module.css';
import { LoadingDinamico } from '../../components/LoadingDinamico/LoadingDinamico';

const formatPhoneNumber = (phone: string) => {
  if (!phone.startsWith('+')) {
    phone = `${phone}`;
  }
  return phone;
};

const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); 
    const formattedPhone = formatPhoneNumber(input);
    setTelefono(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
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
      setErrors((err as any).response?.data?.errors || {});
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
                  required
                  onChange={(e) => setNombre(e.target.value)}
                />
                {errors.nombre && <div className="text-danger">{errors.nombre[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="apellidos" className="form-label">Apellidos</label>
                <input
                  type="text"
                  className="form-control"
                  id="apellidos"
                  placeholder="Ejemplo: Morgan 🤠"
                  value={apellidos}
                  required
                  onChange={(e) => setApellidos(e.target.value)}
                />
                {errors.apellidos && <div className="text-danger">{errors.apellidos[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <div className="input-group">
                  <span className="input-group-text">+</span>
                  <input
                    type="text"
                    className="form-control"
                    id="telefono"
                    placeholder="56999999999"
                    value={telefono}
                    maxLength={11}
                    required
                    onChange={handlePhoneChange}
                  />
                </div>
                {errors.telefono && <div className="text-danger">{errors.telefono[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Ejemplo: thisismyemail@email.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="text-danger">{errors.email[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
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
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {errors.password && <div className="text-danger">{errors.password[0]}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="passwordConfirmation" className="form-label">Confirmar Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPasswordConfirmation ? "text" : "password"}
                    className="form-control"
                    id="passwordConfirmation"
                    placeholder="Confirma tu contraseña"
                    value={passwordConfirmation}
                    required
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  >
                    {showPasswordConfirmation ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {errors.password_confirmation && <div className="text-danger">{errors.password_confirmation[0]}</div>}
              </div>
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