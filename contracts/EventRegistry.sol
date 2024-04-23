// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventRegistry {
    address public owner; // Address of the contract owner
    uint256 public eventCount; // Total count of events

    // Event emitted when a new event is created
    event EventCreated(
        uint256 indexed eventId,
        string name,
        uint256 creationTime,
        uint256 time,
        string venue,
        address creator
    );

    // Event emitted when an event is published
    event EventPublished(uint256 indexed eventId);

    // Event emitted when a student is enrolled in an event
    event StudentEnrolled(uint256 indexed eventId, address indexed student);

    // Structure representing an event
    struct Event {
        uint256 eventId; // Unique identifier for the event
        string name; // Name of the event
        uint256 creationTime; // Time when the event was created
        uint256 time; // Time of the event
        string venue; // Venue of the event
        string ipfsHash; // IPFS hash for event poster
        string description; // Description of the event
        address creator; // Address of the event creator
        bool isActive; // Flag indicating if the event is active
    }

    // Mapping to store events by their eventId
    mapping(uint256 => Event) public events;

    // Mapping to track if an event is published
    mapping(uint256 => bool) public isEventPublished;

    // Mapping to track enrolled students for each event
    mapping(uint256 => mapping(address => bool)) public enrolledStudents;

    // Constructor to set the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Function to create a new event
    function createEvent(
        string memory name,
        uint256 time,
        string memory venue,
        string memory ipfsHash,
        string memory description
    ) external {
        // Increment event count
        eventCount++;
        uint256 creationTime = getCurrentTime();
        address creator = msg.sender;
        // Add event details to events mapping
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

        // Emit EventCreated event
        emit EventCreated(eventCount, name, creationTime, time, venue, creator);
    }

    // Function to get the creator of an event
    function getEventCreator(uint256 _eventId) external view returns (address) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId].creator;
    }

    // Function to remove a published event
    function removePublishedEvent(uint256 _eventId) external {
        events[_eventId].isActive = false;
    }

    // Function to get the current timestamp
    function getCurrentTime() internal view returns (uint256) {
        return block.timestamp;
    }

    // Function to get active events
    function getActiveEvents() external view returns (Event[] memory) {
        // Array to store active events
        Event[] memory activeEvents = new Event[](eventCount);

        uint256 activeCount = 0;
        for (uint256 i = 1; i <= eventCount; i++) {
            if (events[i].isActive) {
                activeCount++;
                activeEvents[activeCount - 1] = events[i];
            }
        }

        // Set array length using assembly
        assembly {
            mstore(activeEvents, activeCount)
        }

        return activeEvents;
    }

    // Function to get event details
    function getEvent(uint256 _eventId) external view returns (Event memory) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId];
    }

    // Function to get the creation time of an event
    function getCreationTime(uint256 _eventId) external view returns (uint256) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        return events[_eventId].creationTime;
    }

    // Function to get event details
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

    // Function to get the total number of events
    function getTotalEvents() external view returns (uint256) {
        return eventCount;
    }

    // Function to get events created by a specific user
    function getEventsCreatedByUser(address _user) external view returns (Event[] memory) {
        // Array to store events created by the user
        Event[] memory eventsCreatedByUser = new Event[](eventCount);

        uint256 userEventCount = 0;
        for (uint256 i = 1; i <= eventCount; i++) {
            if (events[i].isActive && events[i].creator == _user) {
                userEventCount++;
                eventsCreatedByUser[userEventCount - 1] = events[i];
            }
        }

        // Set array length using assembly
        assembly {
            mstore(eventsCreatedByUser, userEventCount)
        }

        return eventsCreatedByUser;
    }

    // Function to enroll a student in an event
    function enrollStudent(uint256 _eventId) external {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");
        address studentId = msg.sender;
        
        require(events[_eventId].isActive, "Event is not active");
        require(!enrolledStudents[_eventId][studentId], "Student already enrolled");

        enrolledStudents[_eventId][studentId] = true;

        // Emit StudentEnrolled event
        emit StudentEnrolled(_eventId, studentId);
    }

    // Function to get enrolled students for an event
    function getEnrolledStudents(uint256 _eventId) external view returns (address[] memory) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");

        mapping(address => bool) storage enrolledMap = enrolledStudents[_eventId];
        uint256 totalEnrolled = 0;

        for (uint256 i = 0; i < eventCount; i++) {
            if (enrolledMap[address(uint160(i))]) {
                totalEnrolled++;
            }
        }

        // Array to store enrolled students
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

    // Function to check if a student is enrolled in an event
    function hasEnrolled(uint256 _eventId, address _studentAddress) external view returns (bool) {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event ID");

        return enrolledStudents[_eventId][_studentAddress];
    }
}
