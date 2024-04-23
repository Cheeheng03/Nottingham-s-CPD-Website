// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventRegistry.sol"; // Import the EventRegistry contract

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract NottinghamToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, ERC20Votes {
    address public eventRegistryAddress; // Address of the EventRegistry contract
    mapping(address => mapping(uint256 => bool)) private _claimed; // Mapping to track claimed tokens for each account and event
    mapping(address => mapping(uint256 => bool)) private _attendanceTaken; // Mapping to track attendance for each account and event

    // Constructor to initialize the contract with the EventRegistry address and mint initial supply to the owner
    constructor(address _eventRegistryAddress)
        ERC20("NottinghamToken", "NOTT")
        Ownable(msg.sender)
        ERC20Permit("NottinghamToken")
    {
        eventRegistryAddress = _eventRegistryAddress;
        _mint(msg.sender, 10000000 * 10 ** decimals()); // Mint initial supply to the contract deployer
    }

    // Function to mint tokens (only callable by the owner)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to get the balance of an account
    function getBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    // Function to transfer tokens
    function transferTokens(address to, uint256 amount) public {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");

        _transfer(_msgSender(), to, amount);
    }

    // Function to check if tokens have been claimed for a specific event by an account
    function hasClaimed(uint256 eventId, address account) public view returns (bool) {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");

        return _claimed[account][eventId];
    }

    // Function to allow accounts to claim tokens for attending an event
    function claimTokens(uint256 eventId, uint256 numberOfTokens) external {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");
        require(numberOfTokens > 0, "Number of tokens must be greater than 0");
        require(!_claimed[msg.sender][eventId], "Tokens already claimed for this event");

        _mint(msg.sender, numberOfTokens * 10**decimals()); // Mint tokens to the sender

        _claimed[msg.sender][eventId] = true; // Mark tokens as claimed for the event
    }

    // Function to mark attendance for an event
    function markAttendance(uint256 eventId) external {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");
        require(!_attendanceTaken[msg.sender][eventId], "Attendance already marked for this event");

        _attendanceTaken[msg.sender][eventId] = true; // Mark attendance for the event
    }

    // Function to check if attendance has been marked for a specific event by an account
    function hasTakenAttendance(uint256 eventId, address account) public view returns (bool) {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");

        return _attendanceTaken[account][eventId];
    }

    // Internal function to get the EventRegistry contract instance
    function eventRegistryContract(address _eventRegistryAddress) internal pure returns (EventRegistry) {
        return EventRegistry(_eventRegistryAddress);
    }

    // Override function to update votes (for ERC20Votes compatibility)
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    // Override function to get nonces (for ERC20Permit compatibility)
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
