import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState();

  const [tasks, setTasks] = useState([]);

  const [taskName, setTaskName] = useState('');

  const [editTask, setEditTask] = useState({ id: '', name: '' });

  const removeLocalTask = (id) => {
    setTasks((tasks) => tasks.filter((task) => task.id !== id));
  };

  const addLocalTask = (task) => setTasks((tasks) => [...tasks, task]);

  const editLocalTask = (editTask) => {
    setTasks((tasks) =>
      tasks.map((task) => {
        if (task.id === editTask.id) {
          task.name = editTask.name;
        }
        return task;
      })
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    socket.emit('newTask', taskName);
    setTaskName('');
  };

  const handleRemoveTask = (id) => {
    socket.emit('removeTask', id);
    removeLocalTask(id);
  };

  const toggleEdit = (task) => {
    editTask.id === task.id ? handleEditTask() : setEditTask(task);
  };

  const handleEditTask = () => {
    const task = tasks.find((t) => t.id === editTask.id);
    if (task) {
      if (editTask.name !== task.name) {
        socket.emit('editTask', { id: task.id, name: editTask.name });
      }
    }
    setEditTask({ id: '', name: '' });
  };

  const handleEditBlur = async () => {
    await new Promise((res) => setTimeout(res, 20));
    if (editTask.id !== '') handleEditTask();
  };

  const initSocket = (socket) => {
    socket.on('updateTasks', (tasks) => setTasks(tasks));
    socket.on('newTask', addLocalTask);
    socket.on('removeTask', removeLocalTask);
    socket.on('editTask', editLocalTask);
    socket.emit('login');
  };

  useEffect(() => {
    const socket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socket);
    initSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className='App'>
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className='tasks-section' id='tasks-section'>
        <h2>Tasks</h2>

        <ul className='tasks-section__list' id='tasks-list'>
          {tasks.map((task) => (
            <li key={task.id} className='task'>
              {editTask.id !== task.id ? (
                task.name
              ) : (
                <input
                  className='text-input'
                  autoFocus
                  onBlur={handleEditBlur}
                  onKeyDown={(e) =>
                    e.key === 'Enter' ? handleEditTask() : null
                  }
                  value={editTask.name}
                  onChange={(e) =>
                    setEditTask({ ...editTask, name: e.target.value })
                  }></input>
              )}
              <button
                style={{ marginLeft: 'auto' }}
                className='btn'
                onClick={() => toggleEdit(task)}>
                Edit
              </button>
              <button
                className='btn btn--red'
                onClick={() => handleRemoveTask(task.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id='add-task-form'>
          <input
            value={taskName}
            onKeyDown={(e) => (e.key === 'Enter' ? handleEditTask() : null)}
            onChange={(e) => setTaskName(e.target.value)}
            className='text-input'
            autoComplete='off'
            type='text'
            placeholder='Type your description'
            id='task-name'
          />
          <button
            onClick={handleAddTask}
            className={`btn ${taskName.length === 0 ? 'btn--disabled' : ''}`}
            type='submit'>
            Add
          </button>
        </form>
      </section>
    </div>
  );
}

export default App;
