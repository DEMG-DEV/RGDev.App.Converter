# ⚡️ Media Converter
> **High-Performance Batch Media Converter for WebP & WebM**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

**Media Converter** is a sleek, cross-platform desktop application built to streamline your media optimization workflow. Convert images to **WebP** and videos to **WebM** instantly with a modern drag-and-drop interface.

---

## 🚀 Features

*   **Batch Processing**: Convert hundreds of files simultaneously.
*   **Format Mastery**: Optimized presets for modern web standards (WebP & WebM).
*   **Drag & Drop**: Intuitive interface for quick file additions.
*   **Real-Time Progress**: Live feedback with individual progress bars and time estimates.
*   **Cross-Platform**: Runs smoothly on macOS, Windows, and Linux.
*   **Dark Mode**: A beautiful, eye-friendly generic dark theme.

## 🛠️ Tech Stack

*   **Core**: [Electron](https://www.electronjs.org/) & Node.js
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Processing**: [FFmpeg](https://ffmpeg.org/) (Static binaries included)
*   **Build System**: Electron Builder

## 📦 Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/RGDev/media-converter.git
cd media-converter
pnpm install
```

## ⚡️ Development

Start the development server with hot-reloading:

```bash
# Start the app
pnpm dev

# Watch CSS changes (in a separate terminal)
pnpm dev:css
```

## 🏗️ Build

Create production-ready executables for your OS:

```bash
# Build for all platforms (configured in package.json)
pnpm dist
```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [RGDev](https://github.com/RGDev)
