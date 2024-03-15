// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventRegistry.sol"; // Import the EventRegistry contract

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract NottinghamToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, ERC20Votes {
    address public eventRegistryAddress;
    mapping(address => mapping(uint256 => bool)) private _claimed;
    mapping(address => mapping(uint256 => bool)) private _attendanceTaken;

    constructor(address _eventRegistryAddress)
        ERC20("NottinghamToken", "NOTT")
        Ownable(msg.sender)
        ERC20Permit("NottinghamToken")
    {
        eventRegistryAddress = _eventRegistryAddress;
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function getBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    function transferTokens(address to, uint256 amount) public {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");

        _transfer(_msgSender(), to, amount);
    }

    function hasClaimed(uint256 eventId, address account) public view returns (bool) {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");

        return _claimed[account][eventId];
    }

    function claimTokens(uint256 eventId, uint256 numberOfTokens) external {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");
        require(numberOfTokens > 0, "Number of tokens must be greater than 0");
        require(!_claimed[msg.sender][eventId], "Tokens already claimed for this event");

        _mint(msg.sender, numberOfTokens * 10**decimals());

        _claimed[msg.sender][eventId] = true;
    }

    function markAttendance(uint256 eventId) external {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");
        require(!_attendanceTaken[msg.sender][eventId], "Attendance already marked for this event");

        _attendanceTaken[msg.sender][eventId] = true;
    }

    function hasTakenAttendance(uint256 eventId, address account) public view returns (bool) {
        require(eventId > 0 && eventId <= eventRegistryContract(eventRegistryAddress).getTotalEvents(), "Invalid event ID");

        return _attendanceTaken[account][eventId];
    }

    function eventRegistryContract(address _eventRegistryAddress) internal pure returns (EventRegistry) {
        return EventRegistry(_eventRegistryAddress);
    }

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
