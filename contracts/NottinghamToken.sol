// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract NottinghamToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, ERC20Votes {
    constructor(address initialOwner)
        ERC20("NottinghamToken", "NOTT")
        Ownable(initialOwner)
        ERC20Permit("NottinghamToken")
    {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to get the balance of an address
    function getBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    // Function to transfer tokens
    function transferTokens(address to, uint256 amount) public {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");

        _transfer(_msgSender(), to, amount);
    }

    // Function to allow users to claim tokens
    function claimTokens(uint256 numberOfTokens) external {
        require(numberOfTokens > 0, "Number of tokens must be greater than 0");

        // You can implement any eligibility criteria here before allowing the claim
        // For simplicity, let's assume anyone can claim

        // Mint tokens to the user
        _mint(msg.sender, numberOfTokens * 10**decimals());
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
