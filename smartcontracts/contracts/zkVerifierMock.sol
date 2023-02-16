pragma solidity ^0.8.9;

contract VerifierMock {
    function verifyProof(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[6] memory _input
    ) public view returns (bool r) {
        return true;
    }
}
