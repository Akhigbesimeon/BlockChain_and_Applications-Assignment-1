import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import RegistryABI from '../contracts/ALUAssetRegistry.json';
import TokenABI from '../contracts/ALULogoToken.json';

const REGISTRY_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const TOKEN_ADDRESS = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

interface WalletContextType {
  account: string | null;
  balance: string;
  connectWallet: () => Promise<void>;
  registryContract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  error: string | null;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [registryContract, setRegistryContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // check if the user has a wallet extension like metamask installed
      if (!(window as any).ethereum) {
        setError("Please install MetaMask or another Web3 wallet to use this application.");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // prompt the user to connect their accounts
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        // save the first account 
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        
        // get the signer so we can execute transactions later
        const signer = await provider.getSigner();

        // wire up the contracts with the signer
        const registry = new ethers.Contract(REGISTRY_ADDRESS, RegistryABI.abi, signer);
        const token = new ethers.Contract(TOKEN_ADDRESS, TokenABI.abi, signer);

        setRegistryContract(registry);
        setTokenContract(token);

        // fetch their initial token balance
        fetchBalance(token, currentAccount);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const fetchBalance = async (tokenInstance: ethers.Contract, userAddress: string) => {
    try {
      const rawBalance = await tokenInstance.balanceOf(userAddress);
      const formattedBalance = ethers.formatUnits(rawBalance, 18); 
      setBalance(formattedBalance);
    } catch (err) {
      console.log("Could not fetch balance", err);
    }
  };

  // listen for network or account changes
  useEffect(() => {
    if ((window as any).ethereum) {
      // Listen for account changes
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setBalance("0");
        }
      });

      // Listen for network/chain resets
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, balance, connectWallet, registryContract, tokenContract, error }}>
      {children}
    </WalletContext.Provider>
  );
};