// src/components/RegisterAsset.tsx
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { WalletContext } from '../context/wallet_context';
import { generateFileHash } from '../utils/hash_generator';

const RegisterAsset = () => {
  const context = useContext(WalletContext);
  const registryContract = context?.registryContract;

  const [assetName, setAssetName] = useState('');
  const [fileType, setFileType] = useState('PNG');
  const [hash, setHash] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handles the file upload and instantly generate the hash
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show image preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Generate hash
      setLoading(true);
      try {
        const generatedHash = await generateFileHash(file);
        setHash(generatedHash);
        setMessage(''); // Clear any previous messages
      } catch (err) {
        setMessage("Error generating hash");
      }
      setLoading(false);
    }
  };

  // Submit to blockchain
  const handleRegister = async () => {
    if (!registryContract || !hash || !assetName) return;

    setLoading(true);
    setMessage('Prompting wallet for approval...');

    try {
      // Call the smart contract function
      const tx = await registryContract.registerAsset(assetName, fileType, hash);
      
      setMessage('Transaction sent! Waiting for confirmation...');
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      setMessage(`Success! Asset Registered on the blockchain.`);
      setHash('');
      setAssetName('');
    } catch (err: any) {
      console.error(err);
      // Catch duplicate hash errors or user rejecting the transaction
      if (err.message.includes("already registered") || err.message.includes("ERROR: This content hash is already registered")) {
        setMessage('Error: This exact file has already been registered.');
      } else if (err.code === "ACTION_REJECTED") {
        setMessage('Transaction rejected by user.');
      } else {
        setMessage('An error occurred during registration.');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Register New Asset</Text>
      
      {/* File Upload */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>1. Select Logo File</Text>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ marginBottom: 10 }}
        />
      </View>

      {/* Image Preview */}
      {previewUrl && (
        <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="contain" />
      )}

      {/* Hash Display */}
      {hash ? (
        <View style={styles.hashBox}>
          <Text style={styles.hashLabel}>Generated Hash (bytes32):</Text>
          <Text style={styles.hashText}>{hash}</Text>
        </View>
      ) : null}

      {/* Form Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>2. Asset Name</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g., ALU Official Logo 2026" 
          value={assetName}
          onChangeText={setAssetName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>3. File Type</Text>
        <TextInput 
          style={styles.textInput} 
          value={fileType}
          onChangeText={setFileType}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.button, (!hash || !assetName || loading) && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={!hash || !assetName || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Register Asset"}
        </Text>
      </TouchableOpacity>

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
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  textInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  preview: { width: '100%', height: 150, marginBottom: 15, backgroundColor: '#f9f9f9' },
  hashBox: { backgroundColor: '#eef', padding: 10, borderRadius: 5, marginBottom: 15 },
  hashLabel: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  hashText: { fontSize: 10, color: '#555' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, alignItems: 'center' },
  disabledButton: { backgroundColor: '#a5d8b1' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  message: { marginTop: 15, textAlign: 'center', fontWeight: 'bold' }
});

export default RegisterAsset;