import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '/src/services/usuarioConfig.js'
import { jwtDecode } from "jwt-decode";

const Login = () => {
   const [view, setView] = useState('login'); // login o recovery
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [rol, setRol] = useState('Alumno'); 
   const navigate = useNavigate();

   const handleLoginSubmit = async (e) => {
   e.preventDefault();
   try {
      // 1. Llamamos al backend para obtener el token
      const token = await loginUsuario(email, password);
      
      // 2. Guardamos el token en localStorage para usarlo después
      localStorage.setItem('token', token);
      
      // 3. Decodificamos el token para extraer el rol y guardarlo
      const decoded = jwtDecode(token);
      localStorage.setItem('role', decoded.role); // 'role' es el nombre que le pusiste en el claim
      
      // 4. Redirigimos
      navigate('/dashboard');
   } catch (error) {
      alert("Credenciales incorrectas o error de conexión");
   }
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
                     {/**EMAIL */}
                     <div className="mb-3">
                        <label className="form-label">Correo Institucional</label>
                        <input
                           type="email"
                           className="form-control"
                           placeholder="nombre@colegio.cl"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                        />
                     </div>

                     {/* PASSWORD */}
                     <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                           type="password"
                           className="form-control"
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                        />
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