# Cista - 3D NFT Viewer & Asset Explorer

A modern web application for viewing and interacting with 3D NFT assets across multiple blockchain networks. Built with React, Three.js, and Web3 technologies.

This app was made to help people easily access and view their 3D files from their Web3 wallets. No backend, no storage - just you and your NFTs.

🌐 [Live Demo](https://toxsam.github.io/NFT-File-Manager/)

## Features

- 🎮 Interactive 3D model viewer supporting GLB, GLTF, and VRM formats
- 🔗 Multi-chain support (Ethereum, Polygon, Arbitrum, Optimism, Base)
- 🔒 Client-side only - no backend required
- 🎨 Modern, responsive UI with dark mode
- 🔑 Secure - bring your own API keys
- 💨 Fast and efficient caching system
- 🖼️ Support for various NFT asset formats

## Tutorial: How to Use the App

### Step 1: Initial Setup
1. Visit the app in your browser
2. Make sure you have MetaMask or another Web3 wallet installed
3. Click the "Connect Wallet" button in the top right
4. Sign in with your wallet when prompted

### Step 2: Set Up Your Alchemy API Key
1. Click the key icon in the top navigation
2. Visit [Alchemy](https://www.alchemy.com/) to get your free API key if you don't have one
3. Create an account and get your API key
4. Paste your API key in the app's key modal
5. Click "Save Key"

### Step 3: Viewing Your NFTs
1. Your NFTs will automatically load after connecting
2. Use the network selector to switch between different blockchains
3. Click on any NFT card to view its 3D model
4. In the viewer, you can:
   - Rotate the model by dragging
   - Zoom in/out using the scroll wheel
   - Pan by right-clicking and dragging
   - Reset the view using the reset button

### Step 4: Managing Assets
1. Use the sidebar to filter different types of NFTs
2. The viewer automatically detects and loads 3D files
3. For VRM files, you get additional avatar controls
4. Use the refresh button to update your NFT list

### Troubleshooting
- If NFTs don't load, verify your Alchemy API key
- Make sure you're connected to the correct network in your wallet
- Check that you're viewing the correct wallet address
- Try refreshing the page if the 3D viewer isn't responding

## Getting Started (Development)

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

---

Made with ❤️ by ToxSam. Feel free to fork it or improve it as you wish! 