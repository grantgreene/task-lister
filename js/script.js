const addNewMobileBtn = document.querySelector('.top-pane__btn');
const addTaskPane = document.querySelector('.add-task-pane');
const addNewTaskBtn = document.querySelector('.add-task-pane__btn');
const addTaskNameInput = document.querySelector('.add-task-pane__name-input');
const addTaskDateInput = document.querySelector('.add-task-pane__date-input');
const taskBoard = document.querySelector('.tasks');
const updateStatusOverlay = document.querySelector('.update-status-overlay');
const searchTasksInput = document.querySelector('.search-tasks-input');
const dateSortBtn = document.querySelectorAll('.date-sort');
const filterCategorySelect = document.querySelector('.filter-category');
const alertNotification = document.querySelector('.alert');
let tasks;
let editTaskId;

getTasksFromLocalStorage = () => {
  if (localStorage.getItem('tasks') === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  }
  return tasks;
};

saveTasksToLocalStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

showAlert = alertText => {
  alertNotification.classList.add('show');
  alertNotification.children[0].textContent = `${alertText}`;
  setTimeout(() => {
    alertNotification.classList.remove('show');
  }, 3000);
};

buildTaskHtml = taskToBuild => {
  const div = document.createElement('div');
  div.classList = 'task-card';
  for (property in taskToBuild) {
    if (property === 'taskId') {
      div.dataset.id = taskToBuild[property];
    } else if (property === 'taskDate') {
      const dateP = document.createElement('p');
      dateP.classList = 'task-card__date';
      const date = new Date(taskToBuild[property]).toLocaleDateString('en-Us', { timeZone: 'UTC' });
      dateP.textContent = `${date}`;
      if (new Date(date) < new Date()) dateP.classList.add('past-due');
      div.appendChild(dateP);
    } else if (property === 'taskDelete') {
      const deleteSpan = document.createElement('span');
      deleteSpan.classList = 'task-card__delete';
      const deleteI = document.createElement('i');
      deleteI.classList = 'fa-solid fa-trash-can';
      deleteSpan.appendChild(deleteI);
      div.appendChild(deleteSpan);
    } else if (property === 'taskName') {
      const nameH1 = document.createElement('h1');
      nameH1.classList = 'task-card__name';
      nameH1.textContent = `${taskToBuild[property]}`;
      div.appendChild(nameH1);
    } else if (property === 'taskStatus') {
      const statusP = document.createElement('p');
      statusP.classList = 'task-card__status';
      const statusSpan = document.createElement('span');
      statusSpan.textContent = 'Status: ';
      const statusText = document.createTextNode(`${taskToBuild[property]} `);
      const statusI = document.createElement('i');
      statusI.classList = 'fa-solid fa-caret-down';
      statusP.appendChild(statusSpan);
      statusP.appendChild(statusText);
      statusP.appendChild(statusI);
      div.appendChild(statusP);
    }
  }
  return div;
};

addTasksToUi = () => {
  taskBoard.innerHTML = '';
  getTasksFromLocalStorage();
  if (tasks.length === 0) {
    document.querySelector('.no-tasks').classList.add('show');
  } else {
    document.querySelector('.no-tasks').classList.remove('show');
    tasks.forEach(task => {
      const buildTask = buildTaskHtml(task);
      taskBoard.appendChild(buildTask);
    });
  }
  filterCategorySelect.value = 'show all';
};

addNewTask = () => {
  let taskName = addTaskNameInput.value;
  let taskDate = addTaskDateInput.value;
  if (taskName === '' && taskDate === '') {
    showAlert('Please enter a task name and task date');
    return;
  } else if (taskName === '') {
    showAlert('Please enter a task name');
    return;
  } else if (taskDate === '') {
    showAlert('Please enter a task date');
    return;
  }
  let taskId = Math.floor(Math.random() * 1000000000) + 1;
  const newTask = { taskId, taskDate, taskName, taskStatus: 'To-Do', taskDelete: false };
  tasks.push(newTask);
  saveTasksToLocalStorage();
  addTasksToUi();
  addTaskNameInput.value = '';
  addTaskDateInput.value = '';
  toggleMobileDropdown();
};

deleteTask = e => {
  if (e.target.classList.contains('fa-trash-can')) {
    const deleteId = parseInt(e.target.parentElement.parentElement.dataset.id);
    tasks.splice(tasks.map(task => task.taskId).indexOf(deleteId), 1);
    saveTasksToLocalStorage();
    addTasksToUi();
  }
};

openEditStatusOverlay = e => {
  if (e.target.classList.contains('task-card__status')) {
    updateStatusOverlay.classList.toggle('open');
    editTaskId = parseInt(e.target.parentElement.dataset.id);
  }
};

editTaskStatus = e => {
  if (e.target.classList.contains('update-status-box__close') || e.target.classList.contains('update-status-overlay')) {
    updateStatusOverlay.classList.toggle('open');
  }
  if (e.target.classList.contains('update-status-box__option')) {
    let newStatus = e.target.textContent;
    updateStatusOverlay.classList.toggle('open');
    taskToEdit = tasks.filter(task => task.taskId === editTaskId)[0];
    taskToEdit.taskStatus = newStatus;
    tasks.splice(tasks.map(task => task.taskId).indexOf(editTaskId), 1, taskToEdit);
    saveTasksToLocalStorage();
    addTasksToUi();
  }
};

searchTasks = e => {
  let searchQuery = searchTasksInput.value.toLowerCase();
  filterCategorySelect.value = 'show all';
  const taskCards = document.querySelectorAll('.task-card');
  taskCards.forEach(taskCard => {
    if (taskCard.children[1].textContent.toLowerCase().indexOf(searchQuery) === -1 && taskCard.children[0].textContent.toLowerCase().indexOf(searchQuery) === -1) {
      taskCard.style.display = 'none';
    } else {
      taskCard.style.display = 'block';
    }
  });
};

sortByDate = e => {
  e.target.classList.contains('date-asc') ? tasks.sort((a, b) => a.taskDate.localeCompare(b.taskDate)) : tasks.sort((a, b) => b.taskDate.localeCompare(a.taskDate));
  saveTasksToLocalStorage();
  addTasksToUi();
};

filterCategories = e => {
  const filterStatus = e.target.value;
  const taskCards = document.querySelectorAll('.task-card');
  taskCards.forEach(taskCard => {
    if (filterStatus === 'show all') {
      taskCard.style.display = 'block';
    } else if (taskCard.children[2].textContent.replace('Status: ', '').trim().toLowerCase() === filterStatus) {
      taskCard.style.display = 'block';
    } else {
      taskCard.style.display = 'none';
    }
  });
};

toggleMobileDropdown = () => {
  addTaskPane.classList.toggle('open');
  addTaskPane.classList.contains('open') ? (addNewMobileBtn.textContent = 'x') && (addNewMobileBtn.style.backgroundColor = 'var(--c-red)') : (addNewMobileBtn.textContent = '+') && (addNewMobileBtn.style.backgroundColor = 'var(--c-green');
};

document.addEventListener('DOMContentLoaded', addTasksToUi);
addNewMobileBtn.addEventListener('click', toggleMobileDropdown);
addNewTaskBtn.addEventListener('click', addNewTask);
taskBoard.addEventListener('click', deleteTask);
taskBoard.addEventListener('click', openEditStatusOverlay);
updateStatusOverlay.addEventListener('click', editTaskStatus);
searchTasksInput.addEventListener('keyup', searchTasks);
dateSortBtn.forEach(btn => {
  btn.addEventListener('click', sortByDate);
});
filterCategorySelect.addEventListener('change', filterCategories);
