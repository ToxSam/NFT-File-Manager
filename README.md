# Cista - 3D NFT Viewer & Asset Explorer

A modern web application for viewing and interacting with 3D NFT assets across multiple blockchain networks. Built with React, Three.js, and Web3 technologies.

🌐 [Live Demo](https://toxsam.github.io/NFT-File-Manager/)

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

## Usage

1. Connect your Web3 wallet
2. Enter your Alchemy API key
3. Browse and interact with your 3D NFT assets
4. Switch between different blockchain networks
5. View and interact with 3D models in real-time

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

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js for 3D rendering
- Alchemy for NFT data access
- React Three Fiber for 3D React components 