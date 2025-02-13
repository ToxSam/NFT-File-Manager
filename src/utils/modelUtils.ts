import type { NFTMetadata } from '../types/wallet';
import { IPFS_GATEWAYS } from './constants';

// Helper to recursively search for 3D model files in metadata
const find3DFiles = (obj: any): string[] => {
  const modelFiles: string[] = [];
  
  const search = (value: any) => {
    if (!value) return;
    
    if (typeof value === 'string') {
      const lowercaseUrl = value.toLowerCase();
      if (lowercaseUrl.endsWith('.vrm') || 
          lowercaseUrl.endsWith('.glb') || 
          lowercaseUrl.endsWith('.gltf')) {
        modelFiles.push(value);
      }
    } else if (typeof value === 'object') {
      Object.values(value).forEach(search);
    }
  };

  search(obj);
  return modelFiles;
};

// Clean and normalize IPFS URL
function cleanIpfsUrl(url: string): string {
  // Remove any markdown-like formatting
  url = url.replace(/\[.*?\]\((.*?)\)/g, '$1');
  
  // Remove any newline characters
  url = url.replace(/\\n/g, '').replace(/\n/g, '');
  
  // Remove any double slashes (except after protocol)
  url = url.replace(/([^:])\/\//g, '$1/');
  
  // Remove any trailing parentheses
  url = url.replace(/\)+$/, '');
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Extract IPFS hash from URL if present
  const ipfsMatch = url.match(/ipfs\/(Qm[a-zA-Z0-9]{44,}|bafy[a-zA-Z0-9]{44,})(\/.*)?/);
  if (ipfsMatch) {
    return ipfsMatch[1] + (ipfsMatch[2] || '');
  }
  
  return url;
}

// Helper function to check if a URL is accessible with proper headers
async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    // Don't use HEAD requests as they often fail with CORS
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });

    return response.ok;
  } catch (e) {
    return false;
  }
}

export const getModelUrl = async (url: string): Promise<string> => {
  if (!url) return url;
  
  // Clean and normalize the URL
  const cleanedUrl = cleanIpfsUrl(url);
  
  // If it's not an IPFS URL, verify accessibility and return
  if (!cleanedUrl.match(/^(Qm[a-zA-Z0-9]{44,}|bafy[a-zA-Z0-9]{44,})/)) {
    // For non-IPFS URLs, just return the URL without checking
    // This allows the loader to handle the request with its own CORS handling
    return url;
  }
  
  // For IPFS URLs, try each gateway without pre-checking
  for (const gateway of IPFS_GATEWAYS) {
    const gatewayUrl = `${gateway}${cleanedUrl}`;
    try {
      const response = await fetch(gatewayUrl, {
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        return gatewayUrl;
      }
    } catch (e) {
      console.log(`Gateway ${gateway} failed, trying next...`);
    }
  }
  
  // If no gateway works, return the original URL and let the loader try
  return url;
};

export function convertToHttps(url: string): string {
  if (!url) return url;
  
  // Clean the URL first
  url = cleanIpfsUrl(url);
  
  // Convert HTTP to HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // If it's an IPFS hash, convert to HTTPS URL
  if (url.match(/^(Qm[a-zA-Z0-9]{44,}|bafy[a-zA-Z0-9]{44,})/)) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  
  return url;
}

// Helper to check if a URL points to a GLTF file
export function isGLTFUrl(url: string): boolean {
  const lowercaseUrl = url.toLowerCase();
  return lowercaseUrl.endsWith('.gltf') || lowercaseUrl.endsWith('.glb');
}

// Helper to get file extension
export function getFileExtension(url: string): string {
  const cleanUrl = cleanIpfsUrl(url);
  return cleanUrl.split('.').pop()?.toLowerCase() || '';
} 