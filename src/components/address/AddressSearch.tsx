import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNetwork } from '../network/NetworkContext';

export const AddressSearch: React.FC = () => {
  const [inputAddress, setInputAddress] = useState('');
  const { selectedNetwork } = useNetwork();

  // Initialize input from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get('address');
    if (address) {
      setInputAddress(address);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAddress) {
      // Update URL with search address
      const url = new URL(window.location.href);
      url.searchParams.set('address', inputAddress);
      window.history.pushState({}, '', url);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('addressSearch', {
        detail: { address: inputAddress }
      }));
    } else {
      // Clear address from URL if input is empty
      const url = new URL(window.location.href);
      url.searchParams.delete('address');
      window.history.pushState({}, '', url);
      
      // Dispatch custom event with null address
      window.dispatchEvent(new CustomEvent('addressSearch', {
        detail: { address: null }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Search by wallet address (0x...)"
          className="w-full bg-[#1a1625] text-white rounded border border-[#2a2435] px-4 py-2 focus:border-purple-500 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <Search size={18} />
        </button>
      </div>
    </form>
  );
}; 