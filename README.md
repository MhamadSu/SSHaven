# SSHaven - AI-Powered SSH Terminal Client

![SSHaven](https://img.shields.io/badge/SSHaven-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

SSHaven is a modern, web-based SSH terminal client with AI-powered assistance. You Can Connect to multiple remote servers simultaneously, manage files, monitor system resources, and get intelligent suggestions for command errors and usage.

## ✨ Features

### Terminal Management
- **Advanced SSH Terminal**: Full-featured terminal with command history and real-time output
- **Command History**: Persistent command history across sessions

### AI-Powered Assistance
- **Natural Language Commands**: Convert English descriptions to shell commands
- **Error Analysis**: AI-powered suggestions for fixing command errors
- **Context-Aware Help**: Get intelligent suggestions based on command output
- **Best Practices**: Receive AI recommendations for command usage
- **Next Steps**: Smart suggestions for follow-up commands

### System Monitoring
- **Real-Time Stats**: Live CPU, memory, and disk usage monitoring
- **Process Management**: View and manage running processes
- **Resource Tracking**: Track system resource utilization over time
- **Health Indicators**: Visual status indicators for system health
- **Auto-Refresh**: Automatic updates every 5 seconds

### Network Tools
- **Port Scanner**: Discover open ports and services on target hosts
- **Ping Tester**: Test network connectivity and measure latency
- **Connection Status**: Real-time connection state monitoring

### File Management
- **File Explorer**: Browse and manage remote files and directories
- **Upload/Download**: Transfer files between local and remote systems
- **File Operations**: Rename and delete.
- **Search & Replace**: Find and replace text in files

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop , tablet and mobile
- **Dark Mode**: Eye-friendly dark theme
- **Animated Transitions**: Smooth transitions between views

### Security Features
- **Secure Connections**: SSH protocol for encrypted communications
- **API Key Management**: Secure storage of AI API keys
- **Session Management**: Secure handling of multiple connections

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Gemini API key for AI features (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MhamadSu/sshaven.git
   cd sshaven
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

4. Open [http://localhost:9002](http://localhost:9002) in your browser

## 🔧 Usage

1. **Connect to a Server**: Enter your SSH credentials (hostname, port, username, password)
2. **Run Commands**: Type commands in the terminal interface
3. **Get AI Help**: Click the magic wand icon when you encounter errors or need help
4. **Manage Files**: Use the file manager panel to navigate and edit files
5. **Monitor Resources**: View CPU, memory, and disk usage in real-time

### AI Features Configuration

To use the AI-powered features (command suggestions, error analysis, natural language translation):

1. Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. In SSHaven, click on Settings and enter your API key
3. The API key is stored securely in your browser's local storage

## 🧩 Architecture

SSHaven is built with:

- **Next.js**: React framework for the frontend
- **TypeScript**: For type-safe code
- **SSH2**: For secure SSH connections
- **Genkit AI**: For AI-powered assistance
- **Tailwind CSS**: For styling
- **Radix UI**: For accessible UI components

## 🛠️ Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run start`: Start the production server
- `npm run lint`: Run linter
- `npm run typecheck`: Run TypeScript type checking

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [SSH2](https://github.com/mscdex/ssh2)
- [Genkit AI](https://genkit.ai/)
