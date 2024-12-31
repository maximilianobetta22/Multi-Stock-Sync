import React from 'react';
import './Login.css';

const Login: React.FC = () => {
    return (
        <>
        <div className="login-container">
            <div className="row h-100">
                <div className="col-12 col-md-4 d-flex flex-column justify-content-center align-items-center bg-white login-left">
                    <form className="text-center">
                        <h1 className="mb-4">Multi-Stock-Sync</h1>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                            <input type="text" className="form-control" id="username" placeholder="Ejemplo: multi@stocksync.io" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="password" className="form-control" id="password" placeholder="Tu contraseña" />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">Iniciar Sesión</button>
                        <a href="#" className="d-block text-decoration-none text-danger mb-3">¿Olvidaste tu contraseña?</a>
                        <div className="help-box bg-light p-3 border">
                            ¿Tienes dudas? <br />
                            <strong>Llámanos al +562 29381115</strong>
                        </div>
                    </form>
                </div>

                <div className="col-12 col-md-8 d-flex flex-column justify-content-center align-items-center bg-orange text-white login-right">
                    <div className="text-center">
                        <h2 className="mb-4">Lorem ipsum dolor sit amet</h2>
                        <h1 className="mb-4">LOREM IPSUM</h1>
                        <p className="mb-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Login;
