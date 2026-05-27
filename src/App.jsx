import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Estados de Autenticación y Perfil
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados del Gestor y Funcionalidades Extra
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [theme, setTheme] = useState('light'); // Estado para el Modo Claro/Oscuro

  useEffect(() => {
    const user = localStorage.getItem('userAuth');
    const role = localStorage.getItem('userRole');
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    
    setTheme(savedTheme);

    if (user && role) {
      setIsLoggedIn(true);
      setUsername(user);
      setUserRole(role);
      loadTasks();
    }
  }, []);

  const loadTasks = () => {
    const storedTasks = JSON.parse(localStorage.getItem('global_tasks')) || [];
    setTasks(storedTasks);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (isLoginMode) {
      const userExists = users.find(u => u.email === email && u.password === password);
      if (userExists) {
        localStorage.setItem('userAuth', email);
        localStorage.setItem('userRole', userExists.role);
        setUsername(email);
        setUserRole(userExists.role);
        setIsLoggedIn(true);
        loadTasks();
      } else {
        alert('Credenciales incorrectas o el usuario no existe.');
      }
    } else {
      const role = e.target.role.value;
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        alert('Este correo ya está registrado.');
      } else {
        users.push({ email, password, role });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('userAuth', email);
        localStorage.setItem('userRole', role);
        setUsername(email);
        setUserRole(role);
        setIsLoggedIn(true);
        loadTasks();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUsername('');
    setUserRole('');
    setTasks([]);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      title: e.target.title.value,
      assignedTo: e.target.assignedTo.value,
      dueDate: e.target.dueDate.value,
      description: '', 
      status: 'Pendiente'
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('global_tasks', JSON.stringify(updatedTasks));
    e.target.reset();
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('global_tasks', JSON.stringify(updatedTasks));
  };

  const changeTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) return { ...task, status: newStatus };
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem('global_tasks', JSON.stringify(updatedTasks));
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    const updatedTasks = tasks.map(task => {
      if (task.id === editingTask.id) {
        return {
          ...task,
          title: e.target.editTitle.value,
          assignedTo: e.target.editAssignedTo.value,
          dueDate: e.target.editDueDate.value,
          description: e.target.editDescription.value
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem('global_tasks', JSON.stringify(updatedTasks));
    setEditingTask(null); 
  };

  // INTEGRACIÓN CON GOOGLE CALENDAR
  const exportToCalendar = (task) => {
    const title = encodeURIComponent(task.title);
    const details = encodeURIComponent(task.description || 'Tarea generada desde el Gestor de Tareas.');
    const date = task.dueDate.replace(/-/g, '');
    // Se crea un evento de todo el día
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${details}`;
    window.open(url, '_blank');
  };

  // Filtro de tareas por rol
  const visibleTasks = userRole === 'Profesor' 
    ? tasks 
    : tasks.filter(t => t.assignedTo === username);

  // SISTEMA DE NOTIFICACIONES / RECORDATORIOS
  const todayDate = new Date().toISOString().split('T')[0];
  const dueTasksToday = visibleTasks.filter(t => t.dueDate === todayDate && t.status !== 'Completada');

  // --- VISTA DE LOGIN ---
  if (!isLoggedIn) {
    return (
      <div data-bs-theme={theme} className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-body text-body">
        <div className="card p-5 shadow-lg border-0 rounded-4 bg-body-tertiary" style={{ width: '100%', maxWidth: '450px' }}>
          <div className="d-flex justify-content-end mb-2">
             <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={toggleTheme} title="Cambiar Tema">
                <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
             </button>
          </div>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{isLoginMode ? 'Bienvenido' : 'Crear Cuenta'}</h2>
          </div>
          <form onSubmit={handleAuth}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo Electrónico</label>
              <input type="email" name="email" className="form-control" id="input-email" required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} name="password" className="form-control" id="input-password" required />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            
            {!isLoginMode && (
              <div className="mb-4">
                <label className="form-label fw-semibold">Perfil de Usuario</label>
                <select name="role" className="form-select" id="input-role">
                  <option value="Alumno">Alumno</option>
                  <option value="Profesor">Profesor</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-2" id="btn-auth">
              {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>
          <div className="text-center mt-4">
            <button className="btn btn-link text-decoration-none text-secondary" onClick={() => setIsLoginMode(!isLoginMode)} id="btn-toggle-auth">
              {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (GESTOR) ---
  return (
    <div data-bs-theme={theme} className="container-fluid py-4 min-vh-100 bg-body text-body transition-colors position-relative">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <h2 className="fw-bold text-primary"><i className="bi bi-kanban me-2"></i>Gestor de Tareas</h2>
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary rounded-circle me-4" onClick={toggleTheme} title="Cambiar Tema">
             <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
          </button>
          <div className="text-end me-3">
            <p className="mb-0 fw-bold">{username}</p>
            <span className={`badge ${userRole === 'Profesor' ? 'bg-primary' : 'bg-info text-dark'}`}>{userRole}</span>
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout} id="btn-logout">
            <i className="bi bi-box-arrow-right me-1"></i>Salir
          </button>
        </div>
      </div>

   {/* Banner de Recordatorios */}
      {dueTasksToday.length > 0 && (
        <div className="alert alert-warning mx-3 shadow-sm d-flex align-items-center rounded-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
          <div>
            {userRole === 'Profesor' ? (
              <span>
                <strong>¡Aviso de Seguimiento!</strong> Hay <strong>{dueTasksToday.length}</strong> tarea(s) en tu tablero que vencen hoy. Ideal para revisar el avance de los alumnos.
              </span>
            ) : (
              <span>
                <strong>¡Alerta de Entrega!</strong> Tienes <strong>{dueTasksToday.length}</strong> tarea(s) pendiente(s) que vencen HOY. ¡Apresúrate a completarlas!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Formulario de Asignación (Solo Profesor) */}
      {userRole === 'Profesor' && (
        <div className="card shadow-sm border-0 mb-4 mx-3 rounded-4 bg-body-tertiary">
          <div className="card-body">
            <form onSubmit={handleAddTask} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-muted small">Título de la tarea</label>
                <input type="text" name="title" className="form-control border-0 shadow-sm" id="task-title" required />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold text-muted small">Asignar a: (Correo del alumno)</label>
                <input type="email" name="assignedTo" className="form-control border-0 shadow-sm" id="task-assigned" required placeholder="alumno@escuela.com" />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold text-muted small">Fecha Límite</label>
                <input type="date" name="dueDate" className="form-control border-0 shadow-sm" id="task-date" required />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100 fw-bold rounded-3 shadow-sm" id="btn-add-task">
                  <i className="bi bi-plus-lg me-1"></i>Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tablero Kanban */}
      <div className="row px-3">
        {/* PENDIENTES */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm bg-body-tertiary" style={{minHeight: '60vh'}}>
            <h5 className="fw-bold text-secondary mb-3">Pendientes <span className="badge bg-secondary rounded-pill ms-2">{visibleTasks.filter(t => t.status === 'Pendiente').length}</span></h5>
            {visibleTasks.filter(t => t.status === 'Pendiente').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-secondary shadow-sm bg-body">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold">{task.title}</h6>
                    <div className="d-flex">
                      <button className="btn btn-sm text-info p-0 me-2" onClick={() => exportToCalendar(task)} title="Añadir al Calendario"><i className="bi bi-calendar-plus fs-5"></i></button>
                      {userRole === 'Profesor' && (
                        <>
                          <button className="btn btn-sm text-primary p-0 me-2" onClick={() => setEditingTask(task)}><i className="bi bi-pencil-square fs-5"></i></button>
                          <button className="btn btn-sm text-danger p-0" onClick={() => handleDeleteTask(task.id)}><i className="bi bi-trash fs-5"></i></button>
                        </>
                      )}
                    </div>
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic">{task.description}</p>}
                  <p className="small text-muted mb-2 mt-2"><i className="bi bi-person me-1"></i>{task.assignedTo}</p>
                  <p className="small text-danger mb-3"><i className="bi bi-calendar-event me-1"></i>{task.dueDate}</p>
                  <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={() => changeTaskStatus(task.id, 'En proceso')} id={`btn-move-process-${task.id}`}>
                    Iniciar Tarea <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EN PROCESO */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm bg-body-tertiary" style={{minHeight: '60vh'}}>
            <h5 className="fw-bold text-warning mb-3">En Proceso <span className="badge bg-warning text-dark rounded-pill ms-2">{visibleTasks.filter(t => t.status === 'En proceso').length}</span></h5>
            {visibleTasks.filter(t => t.status === 'En proceso').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-warning shadow-sm bg-body">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold">{task.title}</h6>
                    <div className="d-flex">
                      <button className="btn btn-sm text-info p-0 me-2" onClick={() => exportToCalendar(task)} title="Añadir al Calendario"><i className="bi bi-calendar-plus fs-5"></i></button>
                      {userRole === 'Profesor' && (
                        <button className="btn btn-sm text-primary p-0" onClick={() => setEditingTask(task)}><i className="bi bi-pencil-square fs-5"></i></button>
                      )}
                    </div>
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic">{task.description}</p>}
                  <p className="small text-muted mb-2 mt-2"><i className="bi bi-person me-1"></i>{task.assignedTo}</p>
                  <p className="small text-danger mb-3"><i className="bi bi-calendar-event me-1"></i>{task.dueDate}</p>
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeTaskStatus(task.id, 'Pendiente')}><i className="bi bi-arrow-left"></i></button>
                    <button className="btn btn-sm btn-success fw-bold" onClick={() => changeTaskStatus(task.id, 'Completada')} id={`btn-move-done-${task.id}`}>Completar <i className="bi bi-check-lg"></i></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLETADAS */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm bg-body-tertiary" style={{minHeight: '60vh'}}>
            <h5 className="fw-bold text-success mb-3">Completadas <span className="badge bg-success rounded-pill ms-2">{visibleTasks.filter(t => t.status === 'Completada').length}</span></h5>
            {visibleTasks.filter(t => t.status === 'Completada').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-success shadow-sm bg-body opacity-75">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold text-decoration-line-through text-muted">{task.title}</h6>
                    {userRole === 'Profesor' && (
                      <button className="btn btn-sm text-danger p-0" onClick={() => handleDeleteTask(task.id)}><i className="bi bi-trash fs-5"></i></button>
                    )}
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic text-decoration-line-through">{task.description}</p>}
                  <p className="small text-muted mb-3 mt-2">Finalizada</p>
                  <div className="d-flex justify-content-start">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeTaskStatus(task.id, 'En proceso')}><i className="bi bi-arrow-left me-1"></i> Regresar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingTask && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 bg-body">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold text-primary">Editar Tarea</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTask(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateTask}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Título</label>
                    <input type="text" name="editTitle" className="form-control" defaultValue={editingTask.title} required id="edit-task-title"/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Descripción</label>
                    <textarea name="editDescription" className="form-control" rows="3" defaultValue={editingTask.description}></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small">Asignado a</label>
                      <input type="email" name="editAssignedTo" className="form-control" defaultValue={editingTask.assignedTo} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small">Fecha Límite</label>
                      <input type="date" name="editDueDate" className="form-control" defaultValue={editingTask.dueDate} required />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setEditingTask(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary fw-bold" id="btn-save-edit">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;