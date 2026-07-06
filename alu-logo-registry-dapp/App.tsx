import React, { useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { WalletProvider, WalletContext } from './src/context/wallet_context';
import RegisterAsset from './src/components/register_asset';

const MainScreen = () => {
  const context = useContext(WalletContext);

  if (!context) return null;

  const { account, balance, connectWallet, error } = context;

  // helper function to shorten address
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ALU Asset Registry</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}

      {!account ? (
        <TouchableOpacity style={styles.button} onPress={connectWallet}>
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.connectedContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Connected: {shortenAddress(account)}</Text>
            <Text style={styles.infoText}>ALUT Balance: {balance}</Text>
          </View>
          
          //Render the Registration Form 
          <RegisterAsset />
          
        </View>
      )}
    </ScrollView>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainScreen />
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 60, 
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  connectedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20, 
    maxWidth: 500,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  }
});