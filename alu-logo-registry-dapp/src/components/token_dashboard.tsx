import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ethers } from 'ethers';
import { WalletContext } from '../context/wallet_context';

const TokenDashboard = () => {
  const context = useContext(WalletContext);
  const account = context?.account;
  const tokenContract = context?.tokenContract;
  const balance = context?.balance;

  const [isOwner, setIsOwner] = useState(false);
  const [totalSupply, setTotalSupply] = useState('1,000,000');
  const [ownershipPercent, setOwnershipPercent] = useState('0');
  
  // Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Example addresses
  const exampleHolders = [
    { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', percent: '5%' },
    { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', percent: '2.5%' },
    { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', percent: '1%' },
  ];

  // Fetch contract data when the component loads or account changes
  useEffect(() => {
    const fetchTokenData = async () => {
      if (tokenContract && account) {
        try {
          // Check if the connected user is the contract owner
          const contractOwner = await tokenContract.owner();
          setIsOwner(contractOwner.toLowerCase() === account.toLowerCase());

          // Fetch total supply
          const supply = await tokenContract.totalSupply();
          const formattedSupply = Number(ethers.formatUnits(supply, 18));
          setTotalSupply(formattedSupply.toLocaleString());

          // Calculate percentage in React instead of Solidity
          const userBalance = await tokenContract.balanceOf(account);
          const formattedBalance = Number(ethers.formatUnits(userBalance, 18));
          
          if (formattedSupply > 0) {
            const calculatedPercent = (formattedBalance / formattedSupply) * 100;
            setOwnershipPercent(calculatedPercent.toFixed(2)); 
          } else {
            setOwnershipPercent('0');
          }

        } catch (err) {
          console.error("Error fetching token data:", err);
        }
      }
    };

    fetchTokenData();
  }, [tokenContract, account]);

  const handleDistribute = async () => {
    if (!tokenContract || !recipient || !amount) return;

    setLoading(true);
    setMessage('Prompting wallet for approval...');

    try {
      const tx = await tokenContract.distributeShares(recipient, amount);
      
      setMessage('Transaction sent! Waiting for confirmation...');
      
      await tx.wait();
      
      setMessage(`[SUCCESS] Distributed ${amount} ALUT to ${recipient.substring(0,6)}...`);
      setRecipient('');
      setAmount('');
      
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Ownable: caller is not the owner")) {
        setMessage('[ERROR] Only the contract owner can distribute shares.');
      } else if (err.code === "ACTION_REJECTED") {
        setMessage('[ERROR] Transaction rejected by user.');
      } else {
        setMessage('[ERROR] Distribution failed. Check recipient address and balance.');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Token Distribution Dashboard</Text>
      
      {/* Ownership Overview */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Your Ownership Overview</Text>
        <Text style={styles.text}>Total ALUT Supply: <Text style={styles.bold}>{totalSupply}</Text></Text>
        <Text style={styles.text}>Your Balance: <Text style={styles.bold}>{balance} ALUT</Text></Text>
        <Text style={styles.text}>Your Equity Stake: <Text style={styles.bold}>{ownershipPercent}%</Text></Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Example Stakeholders</Text>
        {exampleHolders.map((holder, index) => (
          <Text key={index} style={styles.text}>
            • {holder.address.substring(0, 8)}... : <Text style={styles.bold}>{holder.percent}</Text>
          </Text>
        ))}
      </View>

      {/* Shares Distribution */}
      {isOwner ? (
        <View style={styles.ownerSection}>
          <Text style={styles.subHeader}>Admin: Distribute Shares</Text>
          
          <Text style={styles.label}>Recipient Address</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="0x..." 
            value={recipient}
            onChangeText={setRecipient}
          />
          
          <Text style={styles.label}>Amount (ALUT)</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g., 5000" 
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity 
            style={[styles.button, (!recipient || !amount || loading) && styles.disabledButton]} 
            onPress={handleDistribute}
            disabled={!recipient || !amount || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Distribute Tokens"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nonOwnerSection}>
          <Text style={styles.warningText}>
            Token Distribution functionality is locked. Only the contract owner can distribute shares.
          </Text>
        </View>
      )}

      {/* Status Message */}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  section: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  ownerSection: { backgroundColor: '#f0f8ff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#cce5ff' },
  nonOwnerSection: { backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba' },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  text: { fontSize: 14, marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  textInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: 'white' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 15 },
  disabledButton: { backgroundColor: '#80bdff' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  warningText: { color: '#856404', textAlign: 'center', fontWeight: 'bold' },
  message: { marginTop: 15, textAlign: 'center', fontWeight: 'bold' }
});

export default TokenDashboard;