// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NottinghamToken.sol";

contract StudentInfo {
    struct Student {
        string studentID;
        string name;
        string email;
        string password;
        address walletAddress;
    }

    Student[] public students;
    mapping(string => bool) public studentIDExists;
    mapping(address => bool) public walletAddressExists;

    event StudentRegistered(address indexed walletAddress, string studentID, string name, string email);

    function registerStudent(string memory _studentID, string memory _name, string memory _email, string memory _password) public {
        require(bytes(_studentID).length > 0, "Student ID is required");
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_email).length > 0, "Email is required");
        require(bytes(_password).length > 0, "Password is required");

        require(!studentIDExists[_studentID], "Student with this ID already registered");
        require(!walletAddressExists[msg.sender], "Student with this wallet address already registered");

        Student memory newStudent = Student(_studentID, _name, _email, _password, msg.sender);
        students.push(newStudent);
        studentIDExists[_studentID] = true;
        walletAddressExists[msg.sender] = true;

        emit StudentRegistered(msg.sender, _studentID, _name, _email);
    }

    function getStudentInfo() public view returns (string memory, string memory, string memory, string memory, address) {
        for (uint256 i = 0; i < students.length; i++) {
            if (students[i].walletAddress == msg.sender) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress);
            }
        }
        // Return default values if the student is not found
        return ("", "", "", "", address(0));
    }

    function getStudentInfoByStudentID(string memory _studentID) public view returns (string memory, string memory, string memory, string memory, address, string memory) {
        for (uint256 i = 0; i < students.length; i++) {
            if (keccak256(abi.encodePacked(students[i].studentID)) == keccak256(abi.encodePacked(_studentID))) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress, students[i].password);
            }
        }
        // If the student with the provided student ID is not found, return default values
        return ("", "", "", "", address(0), "");
    }

    function getStudentInfoByAddress(address _walletAddress) public view returns (string memory, string memory, string memory, string memory, address) {
        for (uint256 i = 0; i < students.length; i++) {
            if (students[i].walletAddress == _walletAddress) {
                return (students[i].studentID, students[i].name, students[i].email, students[i].password, students[i].walletAddress);
            }
        }
        // If the student with the provided wallet address is not found, return default values
        return ("", "", "", "", address(0));
    }
    
    function getAllStudents() public view returns (Student[] memory) {
        return students;
    }
}
