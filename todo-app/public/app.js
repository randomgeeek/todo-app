const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task';
  if (task.done === 1) {
    li.classList.add('done');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done === 1;

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  
  checkbox.addEventListener('change', async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: checkbox.checked })
    });

    if (!response.ok) {
      alert('Не удалось обновить задачу');
      checkbox.checked = !checkbox.checked;
      return;
    }

    li.classList.toggle('done', checkbox.checked);
  });

  deleteBtn.addEventListener('click', async () => {
    const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });

    if (!response.ok && response.status !== 404) {
      alert('Не удалось удалить задачу');
      return;
    }

    li.remove();
  }); 
     
  li.append(checkbox, title, deleteBtn);
  taskList.append(li);
}

async function loadTasks() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();

  taskList.innerHTML = '';
  tasks.forEach(renderTask);
}

loadTasks();

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (title === '') {
    return;
  }

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title })
  });

  if (!response.ok) {
    alert('Не удалось добавить задачу');
    return;
  }

  const newTask = await response.json();
  renderTask(newTask);

  taskInput.value = '';
  taskInput.focus();
});