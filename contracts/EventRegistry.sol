// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventRegistry {
    address public owner;
    uint256 public eventCount;

    event EventCreated(
        uint256 indexed eventId,
        string name,
        uint256 creationTime,
        uint256 time,
        string venue,
        address creator
    );
    
    event EventPublished(uint256 indexed eventId);
    event StudentEnrolled(uint256 indexed eventId, address indexed student);

    struct Event {
        uint256 eventId;
        string name;
        uint256 creationTime;
        uint256 time;
        string venue;
        string ipfsHash;
        string description;
        address creator;
        bool isActive;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => bool) public isEventPublished;
    mapping(uint256 => mapping(address => bool)) public enrolledStudents;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createEvent(
        string memory name,
        uint256 time,
        string memory venue,
        string memory ipfsHash,
        string memory description
    ) external onlyOwner {
        eventCount++;
        uint256 creationTime = getCurrentTime();
        address creator = msg.sender;
        events[eventCount] = Event({
            eventId: eventCount,
            name: name,
            creationTime: creationTime,
            time: time,
            venue: venue,
            ipfsHash: ipfsHash,
            description: description,
            creator: creator,
            isActive: true
        });

        emit EventCreated(eventCount, name, creationTime, time, venue, creator);
    }

    function getEventCreator(uint256 _eventId) external view returns (address) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId].creator;
    }

    function removePublishedEvent(uint256 _eventId) external onlyOwner {
        events[_eventId].isActive = false;
    }

    function getCurrentTime() internal view returns (uint256) {
        return block.timestamp;
    }

    function getActiveEvents() external view returns (Event[] memory) {
        Event[] memory activeEvents = new Event[](eventCount);

        uint256 activeCount = 0;
        for (uint256 i = 1; i <= eventCount; i++) {
            if (events[i].isActive) {
                activeCount++;
                activeEvents[activeCount - 1] = events[i];
            }
        }

        // Resize the array to remove any empty slots
        assembly {
            mstore(activeEvents, activeCount)
        }

        return activeEvents;
    }

    function getEvent(uint256 _eventId) external view returns (Event memory) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId];
    }

    function getCreationTime(uint256 _eventId) external view returns (uint256) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId].creationTime;
    }

    function getEventDetails(uint256 _eventId) external view returns (
        string memory name,
        uint256 time,
        string memory venue,
        string memory ipfsHash,
        string memory description,
        bool isActive
    ) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        Event memory eventDetails = events[_eventId];

        return (
            eventDetails.name,
            eventDetails.time,
            eventDetails.venue,
            eventDetails.ipfsHash,
            eventDetails.description,
            eventDetails.isActive
        );
    }

    function getTotalEvents() external view returns (uint256) {
        return eventCount;
    }

    function getEventsCreatedByUser(address _user) external view returns (Event[] memory) {
        Event[] memory eventsCreatedByUser = new Event[](eventCount);

        uint256 userEventCount = 0;
        for (uint256 i = 1; i <= eventCount; i++) {
            if (events[i].isActive && events[i].creator == _user) {
                userEventCount++;
                eventsCreatedByUser[userEventCount - 1] = events[i];
            }
        }

        // Resize the array to remove any empty slots
        assembly {
            mstore(eventsCreatedByUser, userEventCount)
        }

        return eventsCreatedByUser;
    }

    function enrollStudent(uint256 _eventId) external {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        address studentId = msg.sender;
        
        require(events[_eventId].isActive, "Event is not active");
        require(!enrolledStudents[_eventId][studentId], "Student already enrolled");

        enrolledStudents[_eventId][studentId] = true;

        emit StudentEnrolled(_eventId, studentId);
    }

    function getEnrolledStudents(uint256 _eventId) external view returns (address[] memory) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");

        mapping(address => bool) storage enrolledMap = enrolledStudents[_eventId];
        uint256 totalEnrolled = 0;

        for (uint256 i = 0; i < eventCount; i++) {
            if (enrolledMap[address(uint160(i))]) {
                totalEnrolled++;
            }
        }

        address[] memory enrolledList = new address[](totalEnrolled);
        uint256 index = 0;

        for (uint256 j = 0; j < eventCount; j++) {
            address studentAddress = address(uint160(j));
            if (enrolledMap[studentAddress]) {
                enrolledList[index] = studentAddress;
                index++;
            }
        }

        return enrolledList;
    }

    function hasEnrolled(uint256 _eventId, address _studentAddress) external view returns (bool) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");

        return enrolledStudents[_eventId][_studentAddress];
    }
}
