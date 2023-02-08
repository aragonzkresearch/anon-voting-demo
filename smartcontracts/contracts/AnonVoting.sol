// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract AnonVoting {

    // We represent each voting process as a struct
    // To create a new process, we call the `newProcess` function
    struct Process {
        address creator; // (=msg.sender) the address that called the `newProcess` function
        string topic; // the topic of the process, for example "Should we change the name of the project to 'AnonVoting'?"

        uint256 startBlockNum; // block number when the process starts
        uint256 endBlockNum; // block number when the process ends, after this block no more votes are accepted and the `endProcess` function can be called

        uint256 censusRoot; // the root of the Sparse Merkle Census tree
        mapping(uint256 => bool) nullifiers; // mapping of nullifiers => used/nullifier, to prevent double votes


        uint8 minTurnout; // % of voters that must vote in order for the proposal to be valid (Quorum), 1 = 1%, 100 = 100%
        uint8 minMajority; // % of voters to be in favour from all voted voters, 1 = 1%, 100 = 100%

        uint256 yesVotes; // num of votes in favour of the proposal, only populated after the process is ended
        uint256 noVotes; // num of votes against the proposal, only populated after the process is ended

        bool closed; // true if the process has been closed, false otherwise
    }


    // We store all the processes in a mapping, where the key is the processID
    // To be able to iterate over all the processes, we also store the last processID
    uint256 public lastProcessID; // Initialized at 0, incremented by 1 every time a new process is created
    mapping(uint256 => Process) public processes; // Mapping of processID => Process

    // Modifier to check if a process exists
    modifier processExists(uint256 _processID) {
        require(lastProcessID >= _processID && _processID != 0, "Process does not exist");
        _;
    }

    // Event to be emitted when a new process is created
    event NewProcess(uint256 processID, address creator, string topic, uint256 startBlockNum, uint256 endBlockNum, uint256 censusRoot, uint8 minTurnout, uint8 minMajority);
    // Event to be emitted when a vote is cast
    event Vote(uint256 processID, bool vote);
    // Event to be emitted when a process is closed
    event ProcessClosed(uint256 processID, bool passed);

    // Constructor
    // TODO: add a parameter to set the Verifier contract address
    constructor() {

    }

    // Function to create a new process
    // Increments the lastProcessID, and stores the new Process into `processes` mapping
    // Note: the first process will have processID = 1 (not 0)
    function newProcess(string memory _topic, uint256 _censusRoot, uint256 _startBlockNum, uint256 _endBlockNum, uint8 _minTurnout, uint8 _minMajority) external {
        lastProcessID++; // Increment lastProcessID by 1
        // Require that both the start and end block numbers are in the future
        require(_startBlockNum > block.number, "Start block number must be in the future");
        require(_endBlockNum > _startBlockNum, "End block number must be after start block number");
        // Create the new process and store it in the mapping
        Process storage process = processes[lastProcessID];
        process.creator = msg.sender;
        process.topic = _topic;
        process.censusRoot = _censusRoot;
        process.startBlockNum = _startBlockNum;
        process.endBlockNum = _endBlockNum;
        process.minTurnout = _minTurnout;
        process.minMajority = _minMajority;
        // `yes` and `no` votes are already initialized at 0

        // Emit the NewProcess event
        emit NewProcess(lastProcessID, msg.sender, _topic, _startBlockNum, _endBlockNum, _censusRoot, _minTurnout, _minMajority);
    }

    // Function to vote in a process
    // Requires the process to be active, and the nullifier to not have been used before
    // Verifies the proof and updates the process accordingly
    function vote(uint256 _processID, bool _vote, uint256 _nullifier, uint256[] memory _proof) processExists(_processID) external {
        Process storage process = processes[_processID];
        // We do not require to check if the process exists, because if it doesn't exist, the process end block number will be 0
        // Require that the process is active
        require(process.startBlockNum <= block.number, "Process has not started yet");
        require(process.endBlockNum > block.number, "Process has ended");
        // Require that the nullifier has not been used before
        require(!process.nullifiers[_nullifier], "Nullifier has been used before");

        // Verify the proof
        // TODO - call the verifyProof function

        // Update the process
        process.nullifiers[_nullifier] = true;
        // We consider the vote to be a "yes" if _vote is true, and a "no" if _vote is false
        if (_vote) {
            process.yesVotes++;
        } else {
            process.noVotes++;
        }

        // Emit the Vote event
        emit Vote(_processID, _vote);
    }

    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }


    // Function to end a process
    // Can only be called after the endBlockNum has passed
    // Returns true if the process has passed, false otherwise
    // TODO: and an option to attach execution data to the process in case it passed
    function closeProcess(uint256 _processID) external processExists(_processID) {
        Process storage process = processes[_processID];
        // Require that the process has been in
        require(process.endBlockNum <= block.number, "Process has not ended yet");
        require(!process.closed, "Process has already been closed");


        // Check if the process has passed
        bool passed = isProcessPassed(_processID);
        // If the process has passed, execute the proposal
        if (passed) {
            // TODO: execute the proposal
        }

        process.closed = true;

        // Emit the ProcessClosed event
        emit ProcessClosed(_processID, passed);
    }

    // Function to check if a process has been passed or not after it has ended
    // Returns true if the process has passed, false otherwise
    function isProcessPassed(uint256 _processID) public view processExists(_processID) returns (bool) {
        Process storage process = processes[_processID];
        // Require that the process has ended
        require(process.endBlockNum < block.number, "Process has not ended yet");
        // Calculate the total number of votes
        uint256 totalVotes = process.yesVotes + process.noVotes;
        if (totalVotes == 0) {
            return false;
        }

        // Calculate the turnout
        uint256 turnout = (process.yesVotes * 100) / totalVotes;
        // Calculate the majority
        uint256 majority = (process.yesVotes * 100) / totalVotes;
        // Return true if the turnout is greater than the minTurnout and the majority is greater than the minMajority
        return (turnout > process.minTurnout) && (majority > process.minMajority);
    }
}