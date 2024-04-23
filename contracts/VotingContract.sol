// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventRegistry.sol"; // Import the EventRegistry contract  

contract VotingContract {
    address public owner; // Address of the contract owner
    uint256 public totalVotes; // Total number of votes across all events
    mapping(uint256 => mapping(address => uint256)) public tokenVotes; // Mapping to track token votes for each event and voter
    mapping(uint256 => uint256) public eventVotes; // Mapping to track total votes for each event
    mapping(address => bool) public hasVoted; // Mapping to track if an address has voted
    mapping(uint256 => uint256) public eventCreationTime; // Mapping to store the creation time of each event
    mapping(uint256 => mapping(uint256 => uint256)) public tokenTotalVotes; // Mapping to track total votes for each token amount and event
    mapping(uint256 => uint256) public finalTokenAmount; // Mapping to store the final token amount decided for each event

    EventRegistry public eventRegistry; // Instance of the EventRegistry contract
    
    event FinalTokenAmountDecided(uint256 indexed eventId, uint256 finalTokens);

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    // Modifier to check if the current time is before the voting deadline for an event
    modifier beforeDeadline(uint256 _eventId) {
        require(block.timestamp < eventRegistry.getCreationTime(_eventId) + 10 minutes, "Voting deadline has passed");
        _;
    }

    // Constructor to initialize the contract with the EventRegistry address
    constructor(address _eventRegistryAddress) {
        owner = msg.sender;
        eventRegistry = EventRegistry(_eventRegistryAddress);
    }

    // Function for voters to cast their votes
    function vote(uint256 _eventId, uint256 _tokens) external beforeDeadline(_eventId) {
        tokenVotes[_eventId][msg.sender] += 1; // Increment token votes for the sender
        eventVotes[_eventId] += _tokens; // Increment total votes for the event
        totalVotes += _tokens; // Increment total votes across all events
        tokenTotalVotes[_eventId][_tokens] += 1; // Increment total votes for the specified token amount 
        hasVoted[msg.sender] = true; // Mark the sender as voted

        decideFinalTokenAmount(_eventId); // Decide the final token amount for the event
    }

    // Internal function to decide the final token amount based on the votes received
    function decideFinalTokenAmount(uint256 _eventId) internal {
        uint256 votesFor5 = tokenTotalVotes[_eventId][5];
        uint256 votesFor10 = tokenTotalVotes[_eventId][10];
        uint256 votesFor15 = tokenTotalVotes[_eventId][15];

        if (votesFor5 >= votesFor10 && votesFor5 >= votesFor15) {
            finalTokenAmount[_eventId] = 5;
        } else if (votesFor10 >= votesFor15) {
            finalTokenAmount[_eventId] = 10;
        } else {
            finalTokenAmount[_eventId] = 15;
        }

        emit FinalTokenAmountDecided(_eventId, finalTokenAmount[_eventId]); // Emit an event for the final token amount decision
    }

    // Function to get event details along with the final token amount decided
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

        finalTokens = finalTokenAmount[_eventId]; // Get the final token amount for the event
    }

    // Function to get the final token amount decided for an event
    function getEventFinalTokens(uint256 _eventId) external view returns (uint256) {
        require(_eventId > 0 && _eventId <= eventRegistry.getTotalEvents(), "Invalid event ID");
        return finalTokenAmount[_eventId];
    }

    // Function to get the number of votes for a specific token amount by a voter for an event
    function getVotesForToken(uint256 _eventId, address _voter) external view returns (uint256 votes) {
        return tokenVotes[_eventId][_voter];
    }

    // Function to get the total number of votes for an event
    function getTotalVotesForEvent(uint256 _eventId) external view returns (uint256) {
        require(_eventId > 0 && _eventId <= eventRegistry.getTotalEvents(), "Invalid event ID");
        return eventVotes[_eventId];
    }

    // Function to get the remaining time for voting for an event
    function getRemainingTime(uint256 _eventId) external view returns (uint256 remainingTime) {
        uint256 creationTime = eventRegistry.getCreationTime(_eventId);
        uint256 votingDeadline = creationTime + 10 minutes;

        if (block.timestamp < votingDeadline) {
            remainingTime = votingDeadline - block.timestamp;
        }
        
        return remainingTime;
    }
}
