const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

// Import the describe function from mocha for explicitness

describe("AnonVoting", function () {
    // We define the default values for the minTurnout and minMajority
    const DEFAULT_MIN_TURNOUT = 25; // 25%
    const DEFAULT_MIN_MAJORITY = 50; // 50%
    
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAnonVotingWithoutZKFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Verifier = await ethers.getContractFactory("VerifierMock");
    const verifier = await Verifier.deploy();

    const AnonVoting = await ethers.getContractFactory("AnonVoting");
    const anonVoting = await AnonVoting.deploy(verifier.address);

    return { anonVoting, owner, otherAccount };
  }

  async function deployAnonVotingFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();

    const AnonVoting = await ethers.getContractFactory("AnonVoting");
    const anonVoting = await AnonVoting.deploy(verifier.address);

    return { anonVoting, owner, otherAccount };
  }

  describe("Deployment", function () {

    it("Should set the lastProcessID to 0", async function () {
      const { anonVoting } = await loadFixture(deployAnonVotingWithoutZKFixture);

      expect(await anonVoting.lastProcessID()).to.equal(0);
    });
  });

  describe("createProcess", function () {
    it("Should create a new process and set its details correctly", async function () {
        const {anonVoting, owner } = await loadFixture(deployAnonVotingWithoutZKFixture);

        const processID = Number(await anonVoting.lastProcessID()) + 1;
        const processTopic = "Test process";
        const startBlockNum = (await ethers.provider.getBlock("latest")).timestamp + 1000;
        const endBlockNum = startBlockNum + 1000;
        const censusRoot = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use censuses in this test

        await anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);

        expect(await anonVoting.lastProcessID()).to.equal(processID);

        // Get the process details
        const processDetails = await anonVoting.processes(processID);

        expect(processDetails.creator).to.equal(owner.address);
        expect(processDetails.topic).to.equal(processTopic);

        expect(processDetails.startBlockNum).to.equal(startBlockNum);
        expect(processDetails.endBlockNum).to.equal(endBlockNum);

        expect(processDetails.censusRoot).to.equal(censusRoot);
        // We can not check the nullifiers map because it is a mapping

        expect(processDetails.minTurnout).to.equal(DEFAULT_MIN_TURNOUT);
        expect(processDetails.minMajority).to.equal(DEFAULT_MIN_MAJORITY);

        expect(processDetails.yesVotes).to.equal(0);
        expect(processDetails.noVotes).to.equal(0);
    });

    it("Should not create a process with an incorrect startBlockNum", async function () {
      const {anonVoting} = await loadFixture(deployAnonVotingWithoutZKFixture);

      const processID = await anonVoting.lastProcessID();
      const processTopic = "Test process";
      // Even current block number is in the past
      const startBlockNum = 0;
      const endBlockNum = startBlockNum + 1000;
      const censusRoot = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use censuses in this test

      // This should throw an error because the startBlockNum is in the past
      await expect(anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY))
          .to.be.rejectedWith("Start block number must be in the future");

      // Make sure the process wasn't created
      expect(await anonVoting.lastProcessID()).to.equal(processID);
    });

    it("Should not create a process with endBlockNum less than or equal to startBlockNum", async function () {
      const {anonVoting} = await loadFixture(deployAnonVotingWithoutZKFixture);

      const processID = await anonVoting.lastProcessID();
      const processTopic = "Test process";
      const startBlockNum = (await ethers.provider.getBlock("latest")).timestamp + 1000;
      const endBlockNum = startBlockNum;
      const censusRoot = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use censuses in this test

      // This should throw an error because endBlockNum must be greater than startBlockNum
      await expect(anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY))
          .to.be.rejectedWith("End block number must be after start block number");

      // Make sure the process wasn't created
      expect(await anonVoting.lastProcessID()).to.equal(processID);
    });
  });

  async function startAnonVotingProcessFixture() {

    const { anonVoting, owner } = await loadFixture(deployAnonVotingWithoutZKFixture);

    const processID = Number(await anonVoting.lastProcessID()) + 1;
    const processTopic = "Test process";
    const startBlockNum = (await ethers.provider.getBlock("latest")).number + 1000;
    const endBlockNum = startBlockNum + 1000;
    const censusRoot = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use censuses in this test

    await anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);

    return { anonVoting, owner, processID, processTopic, startBlockNum, endBlockNum, censusRoot, minTurnout: DEFAULT_MIN_TURNOUT, minMajority: DEFAULT_MIN_MAJORITY };

  }

  describe("vote", function () {
    it("Should not allow to vote if the process does not exist", async function () {
      const { anonVoting, processID } = await loadFixture(startAnonVotingProcessFixture);

      const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use nullifiers in this test

      // This should throw an error because the process does not exist
      await expect(anonVoting.vote(processID + 1, true, nullifier, ["1","1"], [["1","1"],["1","1"]], ["1","1"]))
          .to.be.rejectedWith(/revert/);
    });

    it("Should not allow a vote if the process has not started", async function () {
      const { anonVoting, processID } = await loadFixture(startAnonVotingProcessFixture);

      const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use nullifiers in this test
      const [a, b, c] = [["1","1"], [["1","1"],["1","1"]], ["1","1"]]; // We don't use proofs in this test

      // This should throw an error because the process has not started yet
      await expect(anonVoting.vote(processID, true, nullifier, a, b, c))
          .to.be.rejectedWith("Process has not started yet");
    });

    it("Should not allow a vote if the process has ended", async function () {
      const { anonVoting, processID, endBlockNum} = await loadFixture(startAnonVotingProcessFixture);

      // Skip to the end of the process (2000 blocks)
      const skipBlocks = endBlockNum - (await ethers.provider.getBlock("latest")).number;
      await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]); // Skip 1999 blocks

      const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use nullifiers in this test
      const [a, b, c] = [["1","1"], [["1","1"],["1","1"]], ["1","1"]]; // We don't use proofs in this test

      // This should throw an error because the process has ended
      await expect(anonVoting.vote(processID, true, nullifier, a, b, c))
            .to.be.rejectedWith("Process has ended");
    });

    it("Should allow a vote if the process has started and not ended", async function () {
        const { anonVoting, processID, startBlockNum} = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the very start of the process (1000 blocks)
        const skipBlocks = startBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

        const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use nullifiers in this test
        const [a, b, c] = [["1","1"], [["1","1"],["1","1"]], ["1","1"]]; // We don't use proofs in this test

        // This should not throw an error because the process has started and not ended
        await expect(anonVoting.vote(processID, true, nullifier, a, b, c))
                .to.not.be.rejectedWith(/revert/);

        // Check that the vote was registered
        const processDetails = await anonVoting.processes(processID);
        expect(processDetails.yesVotes).to.equal(1);
        expect(processDetails.noVotes).to.equal(0);
    });

    it("Should not allow a vote with a nullifier that has already been used", async function () {
        const { anonVoting, processID, startBlockNum} = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the very start of the process (1000 blocks)
        const skipBlocks = startBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

        const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // A fixed nullifier
        const [a, b, c] = [["1","1"], [["1","1"],["1","1"]], ["1","1"]]; // We don't use proofs in this test

        // This should not throw an error because the process has started and not ended
        await expect(anonVoting.vote(processID, true, nullifier, a, b, c))
                .to.not.be.rejectedWith(/revert/);

        // Try to vote again with the same nullifier
        await expect(anonVoting.vote(processID, true, nullifier, a, b, c))
                .to.be.rejectedWith('Nullifier has been used before');
    });

      it("Should verify a generated zkproof", async function () {
          // proofAndPI has been generated with the anonvote lib
          const proofAndPI = JSON.parse(`{"publicInputs":{"chainID":"31337","processID":"3","censusRoot":"21823409822845156879367346550439134574128510197817385772757622927609968453408","weight":"1","nullifier":"2118624858783697088557452517993261412014268393748737523839644268649750802296","vote":"1"},"proof":[["2924213430630915703866902299146918413679754219712159207534869393190435105431","17956672624584971245919241488821602897469390883367271267371572616839635574325"],[["14130673802698948280268134371581271546847304042923616990793212171899776891648","10467087115291494182431962173838930747838205210719444081018699110481644541335"],["21270106270254323983869461454419059202030334198944272077964212758661515552409","4592822165267955978060829529502076420540460341765553496690574674560396235621"]],["19638091319210426889512154179350345291593650263103484348752344095219528395396","16036468063877376957677616996053924313020981138569866079649318262289059741910"]]}`);

          const { anonVoting, owner } = await loadFixture(deployAnonVotingFixture); // With ZKVerify activated

          const processTopic = "Test process";
          const startBlockNum = (await ethers.provider.getBlock("latest")).number + 1000;
          const endBlockNum = startBlockNum + 1000;
          const censusRoot = proofAndPI.publicInputs.censusRoot;

          // create some new processes to be in the processID=3 to match the zkproof
          await anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);
          await anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);
          await anonVoting.newProcess(processTopic, censusRoot, startBlockNum, endBlockNum, DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);

          expect(await anonVoting.lastProcessID()).to.equal(proofAndPI.publicInputs.processID);
          const processID = Number(await anonVoting.lastProcessID());

          // Skip to the very start of the process (1000 blocks)
          const skipBlocks = startBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
          await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

          let vote = false;
          if (proofAndPI.publicInputs.vote=="1") {
              vote = true;
          }

          // This should not throw an error because the process has started and
          // not ended and the proof is valid
          await expect(anonVoting.vote(proofAndPI.publicInputs.processID, vote,
              proofAndPI.publicInputs.nullifier, proofAndPI.proof[0],
              proofAndPI.proof[1], proofAndPI.proof[2]))
              .to.not.be.rejectedWith(/revert/);

          // Check that the vote was registered
          const processDetails = await anonVoting.processes(processID);
          expect(processDetails.yesVotes).to.equal(1);
          expect(processDetails.noVotes).to.equal(0);
      });
  });

  describe("endProcess", function () {

    it("Should not allow to end a process if the process does not exist", async function () {
        const { anonVoting, processID } = await loadFixture(startAnonVotingProcessFixture);

        // This should throw an error because the process does not exist
        await expect(anonVoting.closeProcess(processID + 1))
            .to.be.rejectedWith("Process does not exist");
    });

    it("Should not allow to end a process if the process has not ended", async function () {
        const { anonVoting, processID, startBlockNum} = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the very start of the process (1000 blocks)
        const skipBlocks = startBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

        // This should throw an error because the process has not ended
        await expect(anonVoting.closeProcess(processID))
            .to.be.rejectedWith("Process has not ended yet");

    });

    it("Should allow to end a process if the process has ended", async function () {
        const { anonVoting, processID, endBlockNum } = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the end of the process (2000 blocks)
        const skipBlocks = endBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]); // Skip 1999 blocks

        // This should not throw an error because the process has ended
        await expect(anonVoting.closeProcess(processID))
            .to.not.be.rejectedWith(/revert/);

        // Check that the process has been closed
        const processDetails = await anonVoting.processes(processID);
        expect(processDetails.closed).to.equal(true);

        // If no votes were cast, the process should be considered as failed
        await expect(anonVoting.isProcessPassed(processID)).to.eventually.equal(false);
    });

    it("Should not allow to end a process twice", async function () {
        const { anonVoting, processID, endBlockNum } = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the end of the process (2000 blocks)
        const skipBlocks = endBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]); // Skip 1999 blocks

        // This should not throw an error because the process has ended
        await expect(anonVoting.closeProcess(processID))
            .to.not.be.rejectedWith(/revert/);

        // Try to close the process again
        await expect(anonVoting.closeProcess(processID))
            .to.be.rejectedWith("Process has already been closed");
    });

    it("isProcessPassed should return true if the process has passed", async function () {
        const { anonVoting, processID, startBlockNum, endBlockNum } = await loadFixture(startAnonVotingProcessFixture);

        // Skip to the very start of the process (1000 blocks)
        let skipBlocks = startBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

        // Vote yes
        const nullifier = "0x0000000000000000000000000000000000000000000000000000000000000000"; // We don't use nullifiers in this test
        const [a, b, c] = [["1","1"], [["1","1"],["1","1"]], ["1","1"]]; // We don't use proofs in this test
        await anonVoting.vote(processID, true, nullifier, a, b, c);

        // Skip to the end of the process (2000 blocks)
        skipBlocks = endBlockNum - (await ethers.provider.getBlock("latest")).number + 1;
        await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]); // Skip 1999 blocks

        // This should not throw an error because the process has ended
        await expect(anonVoting.closeProcess(processID))
            .to.not.be.rejectedWith(/revert/);

        // Check that the process has passed
        await expect(anonVoting.isProcessPassed(processID)).to.eventually.equal(true);
    });

  });
});
