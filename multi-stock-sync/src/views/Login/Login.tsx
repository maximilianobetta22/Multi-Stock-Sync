import React from 'react';

import './Login.css';

const Login: React.FC = () => {
    return (
        <>

        <div className="login-container">
            <div className="login-box">
                <h1>Multi-Stock-Sync</h1>
                <form>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                        <input type="text" className="form-control" id="username" placeholder="Ejemplo: multi@stocksync.io" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input type="password" className="form-control" id="password" placeholder="Tu contraseña" />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
                    <a href="#" className="d-block text-decoration-none text-danger">¿Olvidaste tu contraseña?</a>
                    <div className="help-box bg-light p-3 border">
                        ¿Tienes dudas? <br />
                        <strong>Llámanos al +562 29381115</strong>
                    </div>
                </form>
            </div>
        </div>
        
        </>
    );
};

export default Login;
