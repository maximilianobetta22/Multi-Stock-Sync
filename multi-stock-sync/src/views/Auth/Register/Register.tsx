import { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import styles from './Register.module.css';

const Register: React.FC = () => {
  
  const [nombre, setNombre] = useState<string>('');
  const [errorNombre, setErrorNombre] = useState<string[]>([]);
  const [apellidos, setApellidos] = useState<string>('');
  const [errorApellidos, setErrorApellidos] = useState<string[]>([]);
  const [telefono, setTelefono] = useState<string>('');
  const [errorTelefono, setErrorTelefono] = useState<string[]>([]);
  const [nombreNegocio, setNombreNegocio] = useState<string>('');
  const [errorNombreNegocio, setErrorNombreNegocio] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [errorEmail, setErrorEmail] = useState<string[]>([]);
  const [password, setPassword] = useState<string>('');
  const [errorPassword, setErrorPassword] = useState<string[]>([]);
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [errorPasswordConfirmation, setErrorPasswordConfirmation] = useState<string[]>([]);

  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmarPassword, setConfirmarShowPassword] = useState<boolean>(false)
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
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
      setError('Formulario incompleto');
      console.log(error)
      const { response } = error as any;
      const { 
        nombre,
        apellidos, 
        telefono, 
        email, 
        nombre_negocio,
        password,
        password_confirmation
      } = response.data.errors;
      setErrorNombre(nombre);
      setErrorApellidos(apellidos);
      setErrorTelefono(telefono);
      setErrorEmail(email);
      setErrorNombreNegocio(nombre_negocio);
      setErrorPassword(password);
      setErrorPasswordConfirmation(password_confirmation);
    }
  };

  const handleShowPassword = (id: string) => {
    if(id === 'passwordConfirmation') {
      setConfirmarShowPassword(!showConfirmarPassword);
      document.getElementById(id)?.setAttribute('type', showConfirmarPassword ? 'password' : 'text')
    } ;
    if(id === 'password') {
      setShowPassword(!showPassword);
      document.getElementById(id)?.setAttribute('type', showPassword ? 'password' : 'text')
    };
  };

  useEffect(() => {
    if(password === passwordConfirmation) setError('')
  }, [password, passwordConfirmation])

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
                id="Nombre"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {errorNombre && nombre.length === 0 &&
                errorNombre.map((error, index) => (
                  <div key={index} className={`${styles.error__formContainer}`}>
                    {error}
                    <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                  </div>
                ))
              }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="apellidos" className="form-label">Apellidos</label>
              <input
                className={`form-control`}
                type="text"
                id="Apellidos"
                placeholder="Apellido"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
              />
              {errorApellidos && apellidos.length === 0 &&
                errorApellidos.map((error, index) => (
                  <div key={index} className={`${styles.error__formContainer}`}>
                    {error}
                    <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                  </div>
                ))
              }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input
                className={`form-control`}
                type="text"
                id="Telefono"
                placeholder="+569 XXXX XXXX"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              {errorTelefono && telefono.length === 0 &&
                errorTelefono.map((error, index) => (
                  <div key={index} className={`${styles.error__formContainer}`}>
                    {error}
                    <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                  </div>
                ))
              }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="nombreNegocio" className="form-label">Nombre del Negocio</label>
              <input
              className={`form-control`}
                type="text"
                id="Nombre del negocio"
                placeholder="Negocio"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
              {errorNombreNegocio && nombreNegocio.length === 0 &&
                errorNombreNegocio.map((error, index) => (
                  <div key={index} className={`${styles.error__formContainer}`}>
                    {error}
                    <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                  </div>
                ))
              }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="username" className="form-label">Email</label>
              <input
                className={`form-control`}
                type="email"
                id="username"
                placeholder="Correo@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errorEmail && email.length === 0 &&
                errorEmail.map((error, index) => (
                  <div key={index} className={`${styles.error__formContainer}`}>
                    {error}
                    <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                  </div>
                ))
              }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                className={`form-control`}
                type="password"
                id="password"
                autoComplete='off'
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
                {
                  (showPassword)
                  ? (
                    <FontAwesomeIcon 
                      onClick={() => handleShowPassword('password')}
                      className={`${styles.iconInput__formContainer}`} 
                      icon={faEye}
                    />
                  )
                  :(
                    <FontAwesomeIcon 
                      onClick={() => handleShowPassword('password')}
                      className={`${styles.iconInput__formContainer}`} 
                      icon={faEyeSlash}
                    />
                  )
                }
                {errorPassword && email.length === 0 &&
                  errorPassword.map((error, index) => (
                    <div key={index} className={`${styles.error__formContainer}`}>
                      {error}
                      <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                    </div>
                  ))
                }
            </div>
            <div className={`${styles.item__formContainer}`}>
              <label htmlFor="passwordConfirmation" className="form-label">Confirmar Contraseña</label>
              <input
              className={`form-control ${styles.input__formContainer}`}
                type="password"
                id="passwordConfirmation"
                placeholder="Confirma tu contraseña"
                autoComplete='off'
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
              {
                  (showConfirmarPassword)
                  ? (
                    <FontAwesomeIcon 
                      onClick={() => handleShowPassword('passwordConfirmation')}
                      className={`${styles.iconInput__formContainer}`} 
                      icon={faEye}
                    />
                  )
                  :(
                    <FontAwesomeIcon 
                      onClick={() => handleShowPassword('passwordConfirmation')}
                      className={`${styles.iconInput__formContainer}`} 
                      icon={faEyeSlash}
                    />
                  )
                }
                {errorPasswordConfirmation && email.length === 0 &&
                  errorPasswordConfirmation.map((error, index) => (
                    <div key={index} className={`${styles.error__formContainer}`}>
                      {error}
                      <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
                    </div>
                  ))
                }
            </div>
            {error && 
              <div className={`${styles.error__formContainer}`}>
                {error}
                <FontAwesomeIcon className={`${styles.iconError__formContainer}`} icon={faCircleXmark}/>  
              </div>
            }
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
