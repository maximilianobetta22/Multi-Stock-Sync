import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Register.css';

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
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <>
            <div className="bg-orange register-container">
                <div className="register-box">
                    <h1>Multi-Stock-Sync</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="nombre" 
                                placeholder="Ejemplo: Marcos" 
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
                                placeholder="Ejemplo: Reyes" 
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
                                placeholder="Ejemplo: +56950369308" 
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="nombreNegocio" className="form-label">Nombre del Negocio</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="nombreNegocio" 
                                placeholder="Ejemplo: Marcos Reyes Negocio" 
                                value={nombreNegocio}
                                onChange={(e) => setNombreNegocio(e.target.value)}
                            />
                        </div>
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
                        <Link to="/login" className="d-block text-decoration-none text-success centered-link">Iniciar Sesión</Link>
                        <div className="help-box bg-light p-3 border">
                            ¿Tienes dudas? <br />
                            <strong>Llámanos al +56 9 0000 0000</strong>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
