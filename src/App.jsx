import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('userAuth');
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
      loadTasks(user);
    }
  }, []);

  const loadTasks = (userEmail) => {
    const storedTasks = JSON.parse(localStorage.getItem(`tasks_${userEmail}`)) || [];
    setTasks(storedTasks);
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
        setUsername(email);
        setIsLoggedIn(true);
        loadTasks(email);
      } else {
        alert('Credenciales incorrectas o el usuario no existe.');
      }
    } else {
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        alert('Este correo ya está registrado.');
      } else {
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('userAuth', email);
        setUsername(email);
        setIsLoggedIn(true);
        loadTasks(email);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    setIsLoggedIn(false);
    setUsername('');
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
    localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks));
    e.target.reset();
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks));
  };

  const changeTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) return { ...task, status: newStatus };
      return task;
    });
    setTasks(updatedTasks);
    localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks));
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
    localStorage.setItem(`tasks_${username}`, JSON.stringify(updatedTasks));
    setEditingTask(null); 
  };

  if (!isLoggedIn) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card p-5 shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '450px' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{isLoginMode ? 'Bienvenido' : 'Crear Cuenta'}</h2>
            <p className="text-muted">Gestiona tus proyectos al instante</p>
          </div>
          <form onSubmit={handleAuth}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo Electrónico</label>
              <input type="email" name="email" className="form-control" id="input-email" required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className="form-control" 
                  id="input-password" 
                  required 
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                  id="btn-toggle-password"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" id="btn-auth">
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

  return (
    <div className="container-fluid py-4 bg-white min-vh-100 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <h2 className="fw-bold text-primary"><i className="bi bi-kanban me-2"></i>Gestor de Tareas</h2>
        <div>
          <span className="me-3 text-muted">Usuario: <strong className="text-dark">{username}</strong></span>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout} id="btn-logout">
            <i className="bi bi-box-arrow-right me-1"></i>Salir
          </button>
        </div>
      </div>

      {/* Formulario Principal */}
      <div className="card shadow border-0 mb-4 mx-3 rounded-4" style={{backgroundColor: '#f8f9fa'}}>
        <div className="card-body">
          <form onSubmit={handleAddTask} className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-muted small">Título de la tarea</label>
              <input type="text" name="title" className="form-control bg-white border-0 shadow-sm" id="task-title" required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted small">Asignar a:</label>
              <input type="text" name="assignedTo" className="form-control bg-white border-0 shadow-sm" id="task-assigned" required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted small">Fecha Límite</label>
              <input type="date" name="dueDate" className="form-control bg-white border-0 shadow-sm" id="task-date" required />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100 fw-bold rounded-3 shadow-sm" id="btn-add-task">
                <i className="bi bi-plus-lg me-1"></i>Agregar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="row px-3">
        {/* Columna 1: Pendientes */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm" style={{backgroundColor: '#f4f5f7', minHeight: '60vh'}}>
            <h5 className="fw-bold text-secondary mb-3">Pendientes <span className="badge bg-secondary rounded-pill ms-2">{tasks.filter(t => t.status === 'Pendiente').length}</span></h5>
            {tasks.filter(t => t.status === 'Pendiente').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-secondary shadow-sm bg-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold">{task.title}</h6>
                    <div>
                      <button className="btn btn-sm text-primary p-0 me-2" onClick={() => setEditingTask(task)} id={`btn-edit-${task.id}`}>
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button className="btn btn-sm text-danger p-0" onClick={() => handleDeleteTask(task.id)} id={`btn-delete-${task.id}`}>
                        <i className="bi bi-trash fs-5"></i>
                      </button>
                    </div>
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic">{task.description}</p>}
                  <p className="small text-muted mb-2 mt-2"><i className="bi bi-person me-1"></i>{task.assignedTo}</p>
                  <p className="small text-danger mb-3"><i className="bi bi-calendar me-1"></i>{task.dueDate}</p>
                  <button className="btn btn-sm btn-primary w-100 fw-bold" onClick={() => changeTaskStatus(task.id, 'En proceso')} id={`btn-move-process-${task.id}`}>
                    Iniciar <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna 2: En Proceso */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm" style={{backgroundColor: '#f4f5f7', minHeight: '60vh'}}>
            <h5 className="fw-bold text-warning mb-3">En Proceso <span className="badge bg-warning text-dark rounded-pill ms-2">{tasks.filter(t => t.status === 'En proceso').length}</span></h5>
            {tasks.filter(t => t.status === 'En proceso').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-warning shadow-sm bg-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold">{task.title}</h6>
                    <button className="btn btn-sm text-primary p-0" onClick={() => setEditingTask(task)}>
                      <i className="bi bi-pencil-square fs-5"></i>
                    </button>
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic">{task.description}</p>}
                  <p className="small text-muted mb-2 mt-2"><i className="bi bi-person me-1"></i>{task.assignedTo}</p>
                  <p className="small text-danger mb-3"><i className="bi bi-calendar me-1"></i>{task.dueDate}</p>
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeTaskStatus(task.id, 'Pendiente')}>
                      <i className="bi bi-arrow-left"></i>
                    </button>
                    <button className="btn btn-sm btn-success fw-bold" onClick={() => changeTaskStatus(task.id, 'Completada')} id={`btn-move-done-${task.id}`}>
                      Completar <i className="bi bi-check-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna 3: Completadas */}
        <div className="col-md-4">
          <div className="p-3 rounded-4 shadow-sm" style={{backgroundColor: '#f4f5f7', minHeight: '60vh'}}>
            <h5 className="fw-bold text-success mb-3">Completadas <span className="badge bg-success rounded-pill ms-2">{tasks.filter(t => t.status === 'Completada').length}</span></h5>
            {tasks.filter(t => t.status === 'Completada').map(task => (
              <div key={task.id} className="card mb-3 border-0 border-start border-4 border-success shadow-sm bg-white opacity-75">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold text-decoration-line-through text-muted">{task.title}</h6>
                    <button className="btn btn-sm text-danger p-0" onClick={() => handleDeleteTask(task.id)}>
                      <i className="bi bi-trash fs-5"></i>
                    </button>
                  </div>
                  {task.description && <p className="small text-muted mb-2 fst-italic text-decoration-line-through">{task.description}</p>}
                  <p className="small text-muted mb-3 mt-2">Finalizada</p>
                  <div className="d-flex justify-content-start">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeTaskStatus(task.id, 'En proceso')}>
                      <i className="bi bi-arrow-left me-1"></i> Regresar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingTask && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
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
                    <textarea 
                      name="editDescription" 
                      className="form-control" 
                      rows="3" 
                      placeholder="Agrega más detalles aquí..." 
                      defaultValue={editingTask.description}
                      id="edit-task-desc"
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small">Asignado a</label>
                      <input type="text" name="editAssignedTo" className="form-control" defaultValue={editingTask.assignedTo} required id="edit-task-assigned"/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small">Fecha Límite</label>
                      <input type="date" name="editDueDate" className="form-control" defaultValue={editingTask.dueDate} required id="edit-task-date"/>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button type="button" className="btn btn-light me-2" onClick={() => setEditingTask(null)}>Cancelar</button>
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