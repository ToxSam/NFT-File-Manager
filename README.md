# Cista - 3D NFT Viewer & Asset Explorer

A modern web application for viewing and interacting with 3D NFT assets across multiple blockchain networks. Built with React, Three.js, and Web3 technologies.

🌐 **[Live Demo](https://toxsam.github.io/NFT-File-Manager/)** | [GitHub Repository](https://github.com/ToxSam/NFT-File-Manager)

## What's in a Name?

The name "Cista" draws inspiration from ancient history - originally a cylindrical vessel used to safeguard precious items. In Roman times, a cista was a sacred container that evolved from a simple basket into an elegant repository for valuable possessions. Much like its historical namesake, our Cista serves as a digital vessel for your valuable 3D NFT assets, allowing you to access, view, and interact with them in a secure and elegant way.

## Why Cista?

This app was created to empower NFT collectors and creators to easily access and interact with their 3D files directly from their wallets. No more struggling with complex file formats or technical barriers - Cista makes it simple to view and manage your digital assets.

## Quick Start Tutorial

### Option 1: Use the Hosted Version (Recommended)
1. Visit [https://toxsam.github.io/NFT-File-Manager/](https://toxsam.github.io/NFT-File-Manager/)
2. Click the key button 🗝️ in the top right
3. Get a free API key from [Alchemy](https://www.alchemy.com/)
4. Paste your key in the modal (your key is stored locally and never shared)
5. Enter any Ethereum wallet address (0x...) in the search bar
6. Start exploring 3D NFTs!

### Option 2: Run Locally
1. Clone the repository:
```bash
git clone https://github.com/ToxSam/NFT-File-Manager.git
cd NFT-File-Manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Follow steps 2-5 from Option 1 to set up your API key and start using the app

### Using the App
1. Once you've entered an API key and wallet address, NFTs will automatically load
2. Use the network selector to switch between different blockchains
3. Click on any NFT card to view its 3D model
4. In the viewer, you can:
   - Rotate the model by dragging
   - Zoom with the scroll wheel
   - Pan by right-clicking and dragging
   - Reset the view with the home button

### Tips & Tricks
- Switch networks to view NFTs across different blockchains
- The cache system remembers your recently viewed models
- Supported formats: GLB, GLTF, and VRM
- Use full screen mode for the best viewing experience

## Features

- 🎮 Interactive 3D model viewer supporting GLB, GLTF, and VRM formats
- 🔗 Multi-chain support (Ethereum, Polygon, Arbitrum, Optimism, Base)
- 🔒 Client-side only - no backend required
- 🎨 Modern, responsive UI with dark mode
- 🔑 Secure - bring your own API keys
- 💨 Fast and efficient caching system
- 🖼️ Support for various NFT asset formats

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Web3 wallet (like MetaMask)
- An Alchemy API key (free tier works fine)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ToxSam/NFT-File-Manager.git
cd NFT-File-Manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

To create a production build:
```bash
npm run build
```

## Technology Stack

- React 18+
- TypeScript
- Three.js / React Three Fiber
- TailwindCSS
- Vite
- Web3 Integration (ethers.js)

## Security

- All API keys and wallet connections are handled client-side
- No sensitive data is stored on servers
- User data is stored locally in the browser
- No backend dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Feel free to fork it or improve it as you wish - this project is meant to grow with the community.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js for 3D rendering
- Alchemy for NFT data access
- React Three Fiber for 3D React components

---
Made with ❤️ by ToxSam 