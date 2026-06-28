import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
   const [view, setView] = useState('login'); // login o recovery
   const navigate = useNavigate();

   const handleLoginSubmit = (e) => {
      e.preventDefault();
      // Aquí irá tu lógica de autenticación con el microservicio.
      // Por ahora, simulamos el éxito redirigiendo al dashboard:
      navigate('/dashboard');
   };

   return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
         <div className="card shadow-lg" style={{ width: '400px' }}>
            <div className="card-body p-5">
               <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">AcademiApp</h2>
                  <p className="text-muted small">Colegio Bernardo O'Higgins</p>
               </div>

               {view === 'login' ? (
                  <form onSubmit={handleLoginSubmit}>
                     <div className="mb-3">
                        <label className="form-label">Correo Institucional</label>
                        <input type="email" className="form-control" placeholder="nombre@colegio.cl" required />
                     </div>
                     <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input type="password" className="form-control" placeholder="••••••••" required />
                     </div>
                     <div className="mb-3">
                        <label className="form-label">Rol de Usuario</label>
                        <select className="form-select">
                           <option>Alumno</option>
                           <option>Apoderado</option>
                           <option>Profesor</option>
                           <option>Inspector</option>
                           <option>Administrativo</option>
                        </select>
                     </div>
                     <button type="submit" className="btn btn-primary w-100 mb-3">Ingresar</button>
                     <div className="text-center">
                        <a href="#" className="text-decoration-none small" onClick={() => setView('recovery')}>
                           ¿Olvidaste tu contraseña?
                        </a>
                     </div>
                  </form>
               ) : (
                  <div>
                     {/* Convertimos el contenedor en un <form> para activar las validaciones nativas */}
                     <form onSubmit={(e) => {
                        e.preventDefault();
                        // Aquí puedes añadir la lógica para llamar a tu servicio de recuperación de Spring Boot
                        alert("Instrucciones enviadas al correo.");
                        setView('login');
                     }}>
                        <h4 className="mb-3">Recuperar Acceso</h4>
                        <p className="small text-muted">Ingresa tu correo para enviarte las instrucciones.</p>

                        <div className="mb-3">
                           {/* Es clave que mantenga el type="email" y el atributo required */}
                           <input
                              type="email"
                              className="form-control"
                              placeholder="correo@ejemplo.com"
                              required
                           />
                        </div>

                        {/* boton principal debe ser type="submit" para que el formulario valide el input */}
                        <button type="submit" className="btn btn-primary w-100 mb-2">
                           Enviar Correo
                        </button>

                        {/* boton vuelve al login, le ponemos type="button" para que NO intente validar el correo al hacer clic */}
                        <button type="button" className="btn btn-light w-100" onClick={() => setView('login')}>
                           Volver
                        </button>
                     </form>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Login;