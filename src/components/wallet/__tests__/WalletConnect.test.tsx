import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletConnect } from '../WalletConnect';
import { WalletContext } from '../WalletContext';

describe('WalletConnect', () => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();

  const renderWithContext = (isConnected = false, address = null) => {
    return render(
      <WalletContext.Provider 
        value={{
          isConnected,
          address,
          chainId: 1,
          connect: mockConnect,
          disconnect: mockDisconnect,
          error: null
        }}
      >
        <WalletConnect />
      </WalletContext.Provider>
    );
  };

  it('renders connect button when not connected', () => {
    renderWithContext(false);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders address when connected', () => {
    const address = '0x1234...5678';
    renderWithContext(true, address);
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it('calls connect when clicking connect button', () => {
    renderWithContext(false);
    fireEvent.click(screen.getByText('Connect Wallet'));
    expect(mockConnect).toHaveBeenCalled();
  });

  it('calls disconnect when clicking connected button', () => {
    renderWithContext(true, '0x1234...5678');
    fireEvent.click(screen.getByText('0x1234...5678'));
    expect(mockDisconnect).toHaveBeenCalled();
  });
}); 