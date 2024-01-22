// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventRegistry.sol";

contract VotingContract {
    address public owner;
    uint256 public totalVotes;
    mapping(uint256 => mapping(address => uint256)) public tokenVotes;
    mapping(uint256 => uint256) public eventVotes;
    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public eventCreationTime;
    mapping(uint256 => mapping(uint256 => uint256)) public tokenTotalVotes;
    mapping(uint256 => uint256) public finalTokenAmount;

    EventRegistry public eventRegistry;
    
    // Event to notify when the final token amount is decided
    event FinalTokenAmountDecided(uint256 indexed eventId, uint256 finalTokens);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier beforeDeadline(uint256 _eventId) {
        require(block.timestamp < eventRegistry.getCreationTime(_eventId) + 10 minutes, "Voting deadline has passed");
        _;
    }

    constructor(address _eventRegistryAddress) {
        owner = msg.sender;
        eventRegistry = EventRegistry(_eventRegistryAddress);  // Initialize EventRegistry contract
    }

    function vote(uint256 _eventId, uint256 _tokens) external beforeDeadline(_eventId) {
        require(!hasVoted[msg.sender], "You have already voted");

        tokenVotes[_eventId][msg.sender] += 1;
        eventVotes[_eventId] += _tokens;
        totalVotes += _tokens;
        tokenTotalVotes[_eventId][_tokens] += 1; 
        hasVoted[msg.sender] = true;

        // Decide and emit the final token amount immediately after the vote
        decideFinalTokenAmount(_eventId);
    }

    function decideFinalTokenAmount(uint256 _eventId) internal {
        // Get the votes for each token
        uint256 votesFor5 = tokenTotalVotes[_eventId][5];
        uint256 votesFor10 = tokenTotalVotes[_eventId][10];
        uint256 votesFor15 = tokenTotalVotes[_eventId][15];

        // Decide the final token amount based on votes
        if (votesFor5 > 0 || votesFor10 > 0 || votesFor15 > 0) {
            // There are votes for at least one option, choose the one with the most votes
            if (votesFor5 >= votesFor10 && votesFor5 >= votesFor15) {
                finalTokenAmount[_eventId] = 5;
            } else if (votesFor10 >= votesFor15) {
                finalTokenAmount[_eventId] = 10;
            } else {
                finalTokenAmount[_eventId] = 15;
            }
        } else {
            // No votes for any option, set the final token amount to 5 by default
            finalTokenAmount[_eventId] = 5;
        }

        // Emit an event to notify the final token amount
        emit FinalTokenAmountDecided(_eventId, finalTokenAmount[_eventId]);
    }

    // Function to get event details along with the final token amount
    function getEventDetailsWithFinalTokenAmount(uint256 _eventId) external view returns (
        string memory name,
        uint256 time,
        string memory venue,
        string memory ipfsHash,
        string memory description,
        uint256 finalTokens
    ) {
        require(_eventId > 0 && _eventId <= eventRegistry.getTotalEvents(), "Invalid event ID");

        (
            name,
            time,
            venue,
            ipfsHash,
            description,
        ) = eventRegistry.getEventDetails(_eventId);

        finalTokens = finalTokenAmount[_eventId];
    }

    function getVotesForToken(uint256 _eventId, address _voter) external view returns (uint256 votes) {
        return tokenVotes[_eventId][_voter];
    }

    function getTotalVotesForEvent(uint256 _eventId) external view returns (uint256) {
        require(_eventId > 0 && _eventId <= eventRegistry.getTotalEvents(), "Invalid event ID");
        return eventVotes[_eventId];
    }

    function getRemainingTime(uint256 _eventId) external view returns (uint256 remainingTime) {
        uint256 creationTime = eventRegistry.getCreationTime(_eventId);
        uint256 votingDeadline = creationTime + 10 minutes;

        if (block.timestamp < votingDeadline) {
            remainingTime = votingDeadline - block.timestamp;
        }

        return remainingTime;
    }
}
