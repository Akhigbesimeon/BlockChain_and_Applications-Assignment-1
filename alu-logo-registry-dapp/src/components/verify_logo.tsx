// src/components/VerifyLogo.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ethers } from 'ethers';
import RegistryABI from '../contracts/ALUAssetRegistry.json';
import { generateFileHash } from '../utils/hash_generator';

const REGISTRY_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 

const VerifyLogo = () => {
  const [manualHash, setManualHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'authentic' | 'fake'>('idle');
  const [metadata, setMetadata] = useState<{ name: string; fileType: string } | null>(null);

  // Initialize a Read-Only connection directly to Hardhat
  const getReadOnlyContract = () => {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    return new ethers.Contract(REGISTRY_ADDRESS, RegistryABI.abi, provider);
  };

  const verifyHashOnChain = async (hashToVerify: string) => {
    setLoading(true);
    setVerificationStatus('idle');
    setMetadata(null);

    try {
      const contract = getReadOnlyContract();
      
      // Call boolean verification function
      const isAuthentic = await contract.verifyLogoIntegrity(hashToVerify);
      
      if (isAuthentic) {
        setVerificationStatus('authentic');
        // Fetch the metadata 
        const assetData = await contract.getAsset(hashToVerify);
        setMetadata({
          name: assetData[0], 
          fileType: assetData[1]
        });
      } else {
        setVerificationStatus('fake');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus('fake'); 
    }
    
    setLoading(false);
  };

  // Handles verification by file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const generatedHash = await generateFileHash(file);
        await verifyHashOnChain(generatedHash);
      } catch (err) {
        console.error("File hashing failed");
        setLoading(false);
      }
    }
  };

  // Handles verification by pasting a hash
  const handleManualVerification = () => {
    if (manualHash.trim()) {
      verifyHashOnChain(manualHash.trim());
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Public Logo Verification</Text>
      <Text style={styles.subtext}>Anyone can verify an asset. No wallet required.</Text>

      {/* Verify by File */}
      <View style={styles.section}>
        <Text style={styles.label}>Option 1: Upload a File to Verify</Text>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </View>

      <Text style={styles.orText}>— OR —</Text>

      {/* Verify by Hash */}
      <View style={styles.section}>
        <Text style={styles.label}>Option 2: Paste a SHA-256 Hash</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Paste 0x... hash here"
          value={manualHash}
          onChangeText={setManualHash}
        />
        <TouchableOpacity style={styles.button} onPress={handleManualVerification} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Checking..." : "Verify Hash"}</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Results Display */}
      {verificationStatus === 'authentic' && (
        <View style={styles.successBox}>
          <Text style={styles.resultTitle}> Logo Verified: This is the authentic ALU logo</Text>
          {metadata && (
            <View style={styles.metadataBox}>
              <Text style={styles.metadataText}>Asset Name: {metadata.name}</Text>
              <Text style={styles.metadataText}>File Type: {metadata.fileType}</Text>
            </View>
          )}
        </View>
      )}

      {verificationStatus === 'fake' && (
        <View style={styles.errorBox}>
          <Text style={styles.resultTitle}> Warning: This logo has been modified or is not registered.</Text>
        </View>
      )}
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
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  subtext: { fontSize: 14, color: '#666', marginBottom: 20 },
  section: { marginBottom: 15, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 5 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  orText: { textAlign: 'center', marginVertical: 10, color: '#999', fontWeight: 'bold' },
  textInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  successBox: { marginTop: 20, padding: 15, backgroundColor: '#d4edda', borderRadius: 5, borderWidth: 1, borderColor: '#c3e6cb' },
  errorBox: { marginTop: 20, padding: 15, backgroundColor: '#f8d7da', borderRadius: 5, borderWidth: 1, borderColor: '#f5c6cb' },
  resultTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  metadataBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#c3e6cb', paddingTop: 10 },
  metadataText: { fontSize: 14, color: '#155724' }
});

export default VerifyLogo;