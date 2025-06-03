# Pomodoro Timer

A modern and intuitive Pomodoro Timer application to boost your productivity and manage your work sessions effectively.

## Features

### Timer Features
- 🕒 Customizable work/break intervals
- 🔔 Audio notifications for session transitions
- 💫 Beautiful and responsive user interface
- 🌙 Dark/Light mode support with theme persistence

### Task Management
- ✅ Create, edit, and delete tasks
- 🏷️ Categorize tasks (Work, Learning, Relaxation, Other)
- 🎯 Track Pomodoros completed per task
- ⏱️ Automatic timestamp tracking
- ✨ Task completion status with visual feedback
- 🔄 Drag-and-drop task reordering
- 🗂️ Filter tasks by status (All/Active/Completed)

### Statistics
- 📊 Session tracking and statistics
- ⏳ Total focus time tracking
- 🍅 Pomodoro count per task
- 💾 Data persistence across sessions

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pomodoro-timer.git
cd pomodoro-timer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Usage

### Timer Usage
1. Set your desired work duration (default: 25 minutes)
2. Set your break duration (default: 5 minutes)
3. Click "Start" to begin your Pomodoro session
4. Work until the timer rings
5. Take a break when prompted
6. Repeat the cycle

### Task Management
1. Enter a task in the input field
2. Select a category (Work/Learning/Relaxation/Other)
3. Press Enter or click "Add Task" to create the task
4. Use the checkbox to mark tasks as complete
5. Click the edit (✏️) button to modify tasks
6. Use the drag handle (⋮⋮) to reorder tasks
7. Filter tasks using the All/Active/Completed buttons
8. Delete tasks using the delete (❌) button

### Theme Switching
- Click the theme toggle (🌙/☀️) to switch between dark and light modes
- Your theme preference is automatically saved

### Settings
- Click the settings (⚙️) button to customize:
  - Work duration
  - Short break duration
  - Long break duration
  - Notification sound

## Tech Stack

- HTML5 & CSS3 - Structure and styling
- JavaScript - Core functionality
- Local Storage - Data persistence
- CSS Custom Properties - Theming
- Drag and Drop API - Task reordering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Pomodoro Technique® by Francesco Cirillo
- Icons provided by [Heroicons](https://heroicons.com/)
- Sound effects from [Mixkit](https://mixkit.co/)