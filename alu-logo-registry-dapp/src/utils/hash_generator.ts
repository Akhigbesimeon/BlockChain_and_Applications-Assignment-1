export const generateFileHash = async (file: File): Promise<string> => {
  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Use browser's Web Crypto API to generate a SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // Convert raw buffer into a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Add the '0x' prefix so the smart contract recognizes it as a bytes32 value
  return `0x${hashHex}`;
};