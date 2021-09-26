// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    /*
     * A little magic, Google what events are in Solodity!
     */
    event NewWave(address indexed from, uint256 timestamp, string message);

    /*
     * We will be using this below to help generate a random number
     */
    uint256 private seed;

    /*
     * I created a struct here named Wave.
     * A struct is basically a custom datatype where we can customize what we want to hold inside it.
     */
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    /*
     * I declare a variable waves that lets me store an array of structs.
     * This is what lets me gold all the waves anyone ever sends to me!
     */
    Wave[] waves;

    struct Waver {
        uint256 waves;
        string message;
        uint256 index;
    }
    mapping(address => Waver) wavers;

    /*
     * This is an address => uint mapping, meaning I can associated an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastWavedAt;

    address[] numberOfWaves;

    constructor() payable {
        console.log("We have been constructed!");
    }

    function getUserWaves(address waver) public view returns (uint256) {
        return wavers[waver].waves;
    }

    function getAllUsersAndWaves() public view returns (address[] memory) {
        return numberOfWaves;
    }

    function trackWaves(address a, string memory message) private {
        wavers[a].waves += 1;
        wavers[a].message = message;
        console.log(
            "Tracking for sender: %s \n\t Waves: %d \n\tLatest Wave message: %s",
            msg.sender,
            wavers[a].waves,
            wavers[a].message
        );
    }

    function wave(string memory waveMessage) public {
        /*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         */
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30s"
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;
        totalWaves += 1;
        /*
         * This is where I actually store the wave data in the array.
         */
        waves.push(Wave(msg.sender, waveMessage, block.timestamp));

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) %
            100;
        console.log("Random # generated: %s", randomNumber);

        seed = randomNumber;

        if (randomNumber < 50) {
            console.log("%s won!", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        /*
         * I added some fanciness here, Google it and try to figure out what it is!
         * Let me know what you learn in #course-chat
         */
        emit NewWave(msg.sender, block.timestamp, waveMessage);
        trackWaves(msg.sender, waveMessage);
        console.log("%s has waved!", msg.sender);
    }

    /*
     * I added a function getAllWaves which will return the struct array, waves, to us.
     * This will make it easy to retrieve the waves from our website!
     */
    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}
