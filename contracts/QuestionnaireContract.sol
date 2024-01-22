// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestionnaireContract {
    address public owner;

    struct Questionnaire {
        string[] questions;
        string[][] options;
        string[] correctAnswers;
    }

    mapping(uint256 => Questionnaire) private eventQuestionnaires;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addQuestionnaire(
        uint256 _eventId,
        string[] memory _questions,
        string[][] memory _options,
        string[] memory _correctAnswers
    ) external onlyOwner {
        require(_questions.length == 2, "Exactly two questions are required");
        require(_options.length == 2, "Exactly two sets of options are required");
        require(_correctAnswers.length == 2, "Exactly two correct answers are required");

        Questionnaire storage questionnaire = eventQuestionnaires[_eventId];

        questionnaire.questions = _questions;
        questionnaire.options = _options;
        questionnaire.correctAnswers = _correctAnswers;
    }

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
}
