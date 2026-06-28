// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ALUAssetRegistry is ERC721 {
    uint256 private _nextTokenId;

    struct AssetMetadata {
        string assetName;
        string fileType;
        bytes32 contentHash;
        address registeredBy;
        uint256 registeredAt;
    }

    mapping(uint256 => AssetMetadata) private _assets;
    mapping(bytes32 => bool) private _registeredHashes;

    event AssetRegistered(uint256 indexed tokenId, bytes32 indexed contentHash, address indexed registeredBy);

    constructor() ERC721("ALU Asset Registry", "ALUAR") {
        _nextTokenId = 1;
    }

    function registerAsset(string memory assetName, string memory fileType, bytes32 contentHash) external returns (uint256) {
        require(!_registeredHashes[contentHash], "ERROR: This content hash is already registered.");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        _assets[tokenId] = AssetMetadata({
            assetName: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            registeredAt: block.timestamp
        });

        _registeredHashes[contentHash] = true;

        emit AssetRegistered(tokenId, contentHash, msg.sender);
        return tokenId;
    }

    function verifyLogoIntegrity(uint256 tokenId, bytes32 providedHash) external view returns (bool, string memory) {
        require(_ownerOf(tokenId) != address(0), "ERROR: Token ID does not exist.");

        if (_assets[tokenId].contentHash == providedHash) {
            return (true, "Logo is authentic.");
        } else {
            return (false, "Warning: logo does not match.");
        }
    }

    function getAsset(uint256 tokenId) external view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "ERROR: Token ID does not exist.");
        return _assets[tokenId];
    }
}
