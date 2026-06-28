// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ALULogoToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1000000;

    constructor(address initialOwner) ERC20("ALU Logo Token", "ALUT") Ownable(initialOwner) {
        // Mint the full supply to the initial owner
        _mint(initialOwner, TOTAL_SUPPLY * 10 ** decimals());
    }

    function distributeShares(address recipient, uint256 amount) external onlyOwner {
        require(amount > 0, "ERROR: Distribution amount must be greater than zero.");
        // Transfer from owner's balance to the recipient
        _transfer(owner(), recipient, amount * 10 ** decimals());
    }

    function ownershipPercentage(address wallet) external view returns (uint256) {
        uint256 balance = balanceOf(wallet) / (10 ** decimals());
        // Calculate percentage
        return (balance * 100) / TOTAL_SUPPLY;
    }
}
