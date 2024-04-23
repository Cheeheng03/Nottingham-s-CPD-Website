// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NottinghamToken.sol"; // Import the NottinghamToken contract

contract StudentInfo {
    // Struct to represent student information
    struct Student {
        string studentID; // Student ID
        string name; // Student name
        string email; // Student email
        string password; // Student password
        address walletAddress; // Ethereum wallet address of the student
    }

    Student[] public students; // Array to store student information
    mapping(string => bool) public studentIDExists; // Mapping to track if a student ID exists
    mapping(address => bool) public walletAddressExists; // Mapping to track if a wallet address exists

    event StudentRegistered(address indexed walletAddress, string studentID, string name, string email);

    // Function to register a new student
    function registerStudent(string memory _studentID, string memory _name, string memory _email, string memory _password) public {
        // Require that all fields are provided
        require(bytes(_studentID).length > 0, "Student ID is required");
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_email).length > 0, "Email is required");
        require(bytes(_password).length > 0, "Password is required");

        // Require that the student ID and wallet address are not already registered
        require(!studentIDExists[_studentID], "Student with this ID already registered");
        require(!walletAddressExists[msg.sender], "Student with this wallet address already registered");

        // Create a new Student object
        Student memory newStudent = Student(_studentID, _name, _email, _password, msg.sender);
        students.push(newStudent); // Add the new student to the array
        studentIDExists[_studentID] = true; // Mark the student ID as registered
        walletAddressExists[msg.sender] = true; // Mark the wallet address as registered

        emit StudentRegistered(msg.sender, _studentID, _name, _email); // Emit an event indicating registration
    }

    // Function to get the information of the caller student
    function getStudentInfo() public view returns (string memory, string memory, string memory, string memory, address) {
        for (uint256 i = 0; i < students.length; i++) {
            if (students[i].walletAddress == msg.sender) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress);
            }
        }
        return ("", "", "", "", address(0));
    }

    // Function to get the information of a student by their student ID
    function getStudentInfoByStudentID(string memory _studentID) public view returns (string memory, string memory, string memory, string memory, address, string memory) {
        for (uint256 i = 0; i < students.length; i++) {
            if (keccak256(abi.encodePacked(students[i].studentID)) == keccak256(abi.encodePacked(_studentID))) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress, students[i].password);
            }
        }
        return ("", "", "", "", address(0), "");
    }

    // Function to get the information of a student by their wallet address
    function getStudentInfoByAddress(address _walletAddress) public view returns (string memory, string memory, string memory, string memory, address) {
        for (uint256 i = 0; i < students.length; i++) {
            if (students[i].walletAddress == _walletAddress) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress);
            }
        }
        return ("", "", "", "", address(0));
    }
    
    // Function to get all students' information
    function getAllStudents() public view returns (Student[] memory) {
        return students;
    }
}
