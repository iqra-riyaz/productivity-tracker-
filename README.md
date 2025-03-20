# Productivity Tracker

A modern web application for tracking productivity using the Pomodoro Technique, task management, and analytics.

## Features

- **Pomodoro Timer**
  - Customizable work and break intervals
  - Visual circular progress bar
  - Sound notifications
  - Browser notifications
  - Session tracking

- **Task Tracker**
  - Drag and drop task management
  - Task status tracking (To Do, In Progress, Done)
  - Task completion tracking
  - Local storage persistence

- **Analytics**
  - Daily focus time tracking
  - Task completion statistics
  - Pomodoro session tracking
  - Visual charts and insights

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Chart.js
- React Beautiful DnD
- Heroicons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/productivity-tracker.git
cd productivity-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   └── dashboard/
│       └── page.tsx       # Dashboard page
├── components/
│   ├── PomodoroTimer.tsx  # Pomodoro timer component
│   ├── TaskTracker.tsx    # Task management component
│   └── Analytics.tsx      # Analytics component
└── styles/
    └── globals.css        # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Chart.js](https://www.chartjs.org/) 