# SSHaven - AI-Powered SSH Terminal Client

![SSHaven](https://img.shields.io/badge/SSHaven-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

SSHaven is a modern, web-based SSH terminal client with AI-powered assistance. You Can Connect to multiple remote servers simultaneously, manage files, monitor system resources, and get intelligent suggestions for command errors and usage.

## ✨ Features

- **Multi-Server Support**: Connect and manage multiple SSH sessions in a tabbed interface
- **AI-Powered Assistance**: Get intelligent suggestions for fixing command errors
- **Natural Language Commands**: Translate plain English to shell commands
- **File Manager**: Browse, upload, download, and edit files on remote servers
- **System Monitoring**: View real-time system resource usage

- **Split View Interface**: Terminal and tools side-by-side for efficient workflow
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Mobile Support**: Coming soon! Access your SSH sessions on the go from any device

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

### Project Structure

```
/
├── src/
│   ├── ai/          # AI integration code
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Utility functions and types
└──  Rest of the files
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [SSH2](https://github.com/mscdex/ssh2)
- [Genkit AI](https://genkit.ai/)
