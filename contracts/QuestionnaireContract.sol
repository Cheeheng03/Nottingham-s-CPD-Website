// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventRegistry.sol"; // Import the EventRegistry contract

contract QuestionnaireContract {
    address public owner; // Address of the contract owner
    EventRegistry public eventRegistry; // Instance of the EventRegistry contract

    // Struct to represent a questionnaire
    struct Questionnaire {
        string[] questions; // Array of questions
        string[][] options; // 2D array of options for each question
        string[] correctAnswers; // Array of correct answers corresponding to each question
    }

    // Mapping to store questionnaires for each event
    mapping(uint256 => Questionnaire) private eventQuestionnaires;
    // Mapping to track if a questionnaire exists for an event
    mapping(uint256 => bool) private eventHasQuestionnaire;

    // Constructor to initialize the contract with the EventRegistry address
    constructor(address _eventRegistryAddress) {
        owner = msg.sender;
        eventRegistry = EventRegistry(_eventRegistryAddress);
    }

    // Function to add a questionnaire for an event
    function addQuestionnaire(
        uint256 _eventId,
        string[] memory _questions,
        string[][] memory _options,
        string[] memory _correctAnswers
    ) external {
        require(_questions.length == 2, "Exactly two questions are required");
        require(_options.length == 2, "Exactly two sets of options are required");
        require(_correctAnswers.length == 2, "Exactly two correct answers are required");

        Questionnaire storage questionnaire = eventQuestionnaires[_eventId];

        questionnaire.questions = _questions;
        questionnaire.options = _options;
        questionnaire.correctAnswers = _correctAnswers;

        eventHasQuestionnaire[_eventId] = true; // Mark that a questionnaire exists for the event
    }

    // Function to get the questionnaire details for an event
    function getQuestionnaire(uint256 _eventId) external view returns (
        string[] memory questions,
        string[][] memory options,
        string[] memory correctAnswers
    ) {
        Questionnaire storage questionnaire = eventQuestionnaires[_eventId];
        questions = questionnaire.questions;
        options = questionnaire.options;
        correctAnswers = questionnaire.correctAnswers;
    }

    // Function to check if a questionnaire exists for an event
    function questionnaireExists(uint256 _eventId) external view returns (bool) {
        return eventHasQuestionnaire[_eventId];
    }
}
