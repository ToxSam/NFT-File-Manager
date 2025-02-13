import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletConnect } from '../WalletConnect';
import { WalletContext } from '../WalletContext';

describe('WalletConnect', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  const renderWithContext = (isConnected: boolean = false, address: string | null = null) => {
    return render(
      <WalletContext.Provider
        value={{
          isConnected,
          address,
          connect: mockConnect,
          disconnect: mockDisconnect
        }}
      >
        <WalletConnect />
      </WalletContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button when not connected', () => {
    renderWithContext(false, null);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });

  it('renders disconnect button and address when connected', () => {
    const address = '0x1234567890abcdef';
    renderWithContext(true, address);
    expect(screen.getByText(address)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('calls connect when connect button is clicked', () => {
    renderWithContext(false, null);
    fireEvent.click(screen.getByText(/connect wallet/i));
    expect(mockConnect).toHaveBeenCalled();
  });

  it('calls disconnect when disconnect button is clicked', () => {
    renderWithContext(true, '0x1234567890abcdef');
    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));
    expect(mockDisconnect).toHaveBeenCalled();
  });
}); 