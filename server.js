const express = require('express');
const path = require('path');
const socket = require('socket.io');
const { v4 } = require('uuid');

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));

app.use((req, res) => {
  res.status(404).send('Not found...');
});

const server = app.listen(8000, () => {
  console.log('Server is running on 8000');
});

let tasks = [];

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('login', () => {
    socket.emit('updateTasks', tasks);
  });

  socket.on('newTask', (name) => {
    const task = { name, id: v4() };
    tasks.push(task);
    socket.emit('newTask', task);
    socket.broadcast.emit('newTask', task);
  });

  socket.on('editTask', (editTask) => {
    tasks = tasks.map((task) => {
      if (task.id === editTask.id) {
        task.name = editTask.name;
      }
      return task;
    });
    socket.emit('editTask', editTask);
    socket.broadcast.emit('editTask', editTask);
  });

  socket.on('removeTask', (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    socket.broadcast.emit('removeTask', id);
  });
});
