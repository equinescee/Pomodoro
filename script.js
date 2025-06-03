// Timer durations in seconds
let POMODORO_TIME = 25 * 60;
let SHORT_BREAK_TIME = 5 * 60;
let LONG_BREAK_TIME = 15 * 60;

// Timer state
let timeLeft = POMODORO_TIME;
let timerId = null;
let isRunning = false;

// Task management state
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Initialize tasks from localStorage immediately
try {
    const savedTasks = localStorage.getItem('pomodoroTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
} catch (e) {
    console.error('Error loading initial tasks:', e);
}

// DOM elements
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const pomodoroButton = document.getElementById('pomodoro');
const shortBreakButton = document.getElementById('short-break');
const longBreakButton = document.getElementById('long-break');
const themeToggle = document.getElementById('theme-toggle');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task');
const taskCategory = document.getElementById('task-category');
const editTaskModal = document.getElementById('edit-task-modal');
const editTaskText = document.getElementById('edit-task-text');
const editTaskCategory = document.getElementById('edit-task-category');
const saveTaskEdit = document.getElementById('save-task-edit');
const cancelTaskEdit = document.getElementById('cancel-task-edit');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskTemplate = document.getElementById('task-template');
const settingsToggle = document.getElementById('settings-toggle');
const settingsModal = document.getElementById('settings-modal');
const saveSettings = document.getElementById('save-settings');
const closeSettings = document.getElementById('close-settings');
const pomodoroDuration = document.getElementById('pomodoro-duration');
const shortBreakDuration = document.getElementById('short-break-duration');
const longBreakDuration = document.getElementById('long-break-duration');
const notificationSound = document.getElementById('notification-sound');
const clearTasksButton = document.getElementById('clear-tasks');

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleButton(newTheme);
}

function updateThemeToggleButton(theme) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', 
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
    );
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update timer display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

// Start timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                alert('Time is up!');
            }
        }, 1000);
    }
}

// Pause timer
function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
}

// Reset timer
function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = POMODORO_TIME;
    updateDisplay();
}

// Set timer type
function setTimerType(type) {
    clearInterval(timerId);
    isRunning = false;
    
    // Remove active class from all timer type buttons
    pomodoroButton.classList.remove('active');
    shortBreakButton.classList.remove('active');
    longBreakButton.classList.remove('active');
    
    // Set new timer duration and active button
    switch(type) {
        case 'pomodoro':
            timeLeft = POMODORO_TIME;
            pomodoroButton.classList.add('active');
            break;
        case 'short':
            timeLeft = SHORT_BREAK_TIME;
            shortBreakButton.classList.add('active');
            break;
        case 'long':
            timeLeft = LONG_BREAK_TIME;
            longBreakButton.classList.add('active');
            break;
    }
    
    updateDisplay();
}

// Task management
function createTaskObject(text, category) {
    return {
        id: Date.now(),
        text,
        category,
        completed: false,
        timestamp: new Date().toISOString(),
        pomodorosCompleted: 0,
        order: tasks.length
    };
}

function createTaskElement(task) {
    const taskElement = taskTemplate.content.cloneNode(true).children[0];
    
    // Set task content
    taskElement.dataset.id = task.id;
    taskElement.dataset.order = task.order;
    
    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.checked = task.completed;
    
    const textSpan = taskElement.querySelector('.task-text');
    textSpan.textContent = task.text;
    
    const categorySpan = taskElement.querySelector('.task-category');
    categorySpan.textContent = task.category;
    categorySpan.dataset.category = task.category;
    
    const timestampSpan = taskElement.querySelector('.task-timestamp');
    timestampSpan.textContent = formatTimestamp(task.timestamp);
    
    const pomodorosSpan = taskElement.querySelector('.task-pomodoros');
    pomodorosSpan.textContent = `🍅 ${task.pomodorosCompleted}`;
    
    if (task.completed) {
        taskElement.classList.add('completed');
    }
    
    // Add event listeners
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    taskElement.querySelector('.edit-task').addEventListener('click', () => {
        showEditTaskModal(task);
    });
    
    taskElement.querySelector('.delete-task').addEventListener('click', () => {
        deleteTask(task.id);
    });
    
    // Drag and drop handlers
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragend', handleDragEnd);
    taskElement.addEventListener('dragover', handleDragOver);
    taskElement.addEventListener('drop', handleDrop);
    
    return taskElement;
}

function addTask(taskText, category) {
    if (!taskText) return;
    
    const task = createTaskObject(taskText, category);
    tasks.push(task);
    saveTasks();
    
    if (shouldShowTask(task)) {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    }
    
    clearTaskInput();
}

function updateTask(taskId, updates) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function showEditTaskModal(task) {
    editingTaskId = task.id;
    editTaskText.value = task.text;
    editTaskCategory.value = task.category;
    editTaskModal.classList.add('show');
}

function hideEditTaskModal() {
    editingTaskId = null;
    editTaskModal.classList.remove('show');
}

function handleTaskEdit() {
    if (!editingTaskId) return;
    
    updateTask(editingTaskId, {
        text: editTaskText.value,
        category: editTaskCategory.value
    });
    
    hideEditTaskModal();
}

function clearTaskInput() {
    taskInput.value = '';
    taskCategory.value = 'work';
}

// Drag and drop functionality
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const currentElement = e.currentTarget;
    
    if (draggingElement !== currentElement) {
        const dragBox = draggingElement.getBoundingClientRect();
        const staticBox = currentElement.getBoundingClientRect();
        
        if (staticBox.top < dragBox.top) {
            currentElement.parentNode.insertBefore(draggingElement, currentElement);
        } else {
            currentElement.parentNode.insertBefore(draggingElement, currentElement.nextSibling);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    updateTaskOrder();
}

function updateTaskOrder() {
    const taskElements = taskList.querySelectorAll('.task-item');
    const newOrder = Array.from(taskElements).map((element, index) => ({
        id: parseInt(element.dataset.id),
        order: index
    }));
    
    tasks.forEach(task => {
        const orderInfo = newOrder.find(o => o.id === task.id);
        if (orderInfo) {
            task.order = orderInfo.order;
        }
    });
    
    saveTasks();
}

// Filter functionality
function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

function shouldShowTask(task) {
    console.log('Checking task visibility:', task, 'for filter:', currentFilter);
    switch(currentFilter) {
        case 'active':
            return !task.completed;
        case 'completed':
            return task.completed;
        default:
            return true;
    }
}

// Utility functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function saveTasks() {
    try {
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving tasks:', e);
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('pomodoroTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        renderTasks();
    } catch (e) {
        console.error('Error loading tasks:', e);
    }
}

function renderTasks() {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    const filteredTasks = tasks
        .sort((a, b) => a.order - b.order)
        .filter(shouldShowTask);
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Update task Pomodoro count when timer completes
function updateTaskPomodoros() {
    if (currentMode === 'pomodoro' && currentTask) {
        const task = tasks.find(t => t.id === currentTask);
        if (task) {
            task.pomodorosCompleted++;
            saveTasks();
            renderTasks();
        }
    }
}

// Settings functionality
function showSettingsModal() {
    // Load current values into settings form
    pomodoroDuration.value = Math.floor(POMODORO_TIME / 60);
    shortBreakDuration.value = Math.floor(SHORT_BREAK_TIME / 60);
    longBreakDuration.value = Math.floor(LONG_BREAK_TIME / 60);
    notificationSound.value = localStorage.getItem('notificationSound') || 'bell';
    
    settingsModal.classList.add('show');
}

function hideSettingsModal() {
    settingsModal.classList.remove('show');
}

function saveSettingsChanges() {
    // Update timer durations (convert minutes to seconds)
    POMODORO_TIME = pomodoroDuration.value * 60;
    SHORT_BREAK_TIME = shortBreakDuration.value * 60;
    LONG_BREAK_TIME = longBreakDuration.value * 60;
    
    // Save to localStorage
    localStorage.setItem('pomodoroTime', POMODORO_TIME);
    localStorage.setItem('shortBreakTime', SHORT_BREAK_TIME);
    localStorage.setItem('longBreakTime', LONG_BREAK_TIME);
    localStorage.setItem('notificationSound', notificationSound.value);
    
    // Reset timer to current mode
    resetTimer();
    hideSettingsModal();
}

// Load saved settings
function loadSavedSettings() {
    POMODORO_TIME = parseInt(localStorage.getItem('pomodoroTime')) || 25 * 60;
    SHORT_BREAK_TIME = parseInt(localStorage.getItem('shortBreakTime')) || 5 * 60;
    LONG_BREAK_TIME = parseInt(localStorage.getItem('longBreakTime')) || 15 * 60;
    timeLeft = POMODORO_TIME; // Set initial time
    updateDisplay();
}

// Initialize theme, tasks, settings, and display
function initializeApp() {
    initializeTheme();
    loadSavedSettings();
    
    // Set initial filter state
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    currentFilter = 'all';
    
    // Render tasks with current filter
    renderTasks();
    updateDisplay();
}

function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// Event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
pomodoroButton.addEventListener('click', () => setTimerType('pomodoro'));
shortBreakButton.addEventListener('click', () => setTimerType('short'));
longBreakButton.addEventListener('click', () => setTimerType('long'));
themeToggle.addEventListener('click', toggleTheme);
settingsToggle.addEventListener('click', showSettingsModal);
saveSettings.addEventListener('click', saveSettingsChanges);
closeSettings.addEventListener('click', hideSettingsModal);
addTaskButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        addTask(text, taskCategory.value);
    }
});
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim()) {
        addTask(taskInput.value.trim(), taskCategory.value);
    }
});
saveTaskEdit.addEventListener('click', handleTaskEdit);
cancelTaskEdit.addEventListener('click', hideEditTaskModal);
filterButtons.forEach(button => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
});
clearTasksButton.addEventListener('click', clearAllTasks);

// Initialize the app
initializeApp(); 