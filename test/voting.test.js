const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");

contract("Voting", function (accounts) {
  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const intrus = accounts[3];
  const proposalDescription1 = "Proposal 1";

  let votingInstance;

  beforeEach(async function () {
    votingInstance = await Voting.new({ from: admin });
  });

  // Test ajout d'un voteur par l'admin
  it("...l'Admin ajoute un voteur", async function () {
    const accesAdmin = await votingInstance.addVoter(voter1, { from: admin });
    voter = await votingInstance.getVoter(voter1, { from: voter1 });
    expect(voter.isRegistered).to.equal(true);
    expectEvent(accesAdmin, "VoterRegistered", { voterAddress: voter1 });
  });

  // Test : Seul l'admin peut ajouter un voteur
  it("...Seul l'admin ajoute un électeur", async function () {
    await expectRevert(
      votingInstance.addVoter(voter2, { from: voter1 }),
      "Ownable: caller is not the owner"
    );
  });

  // Seul l'admin contrôle l'enregistrement des propositions de vote
  it("...seul l'admin peut enregistrer les propositions des voteurs", async function () {
    await expectRevert(
      votingInstance.startProposalsRegistering({ from: voter1 }),
      "Ownable: caller is not the owner"
    );
  });

  // Test : Un enregistrement par votant
  it("...Un électeur n'est enregistré qu'une seule fois", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await expectRevert(
      votingInstance.addVoter(voter1, { from: admin }),
      "Already registered"
    );
  });

  // Test : Les enregistrements des électeurs ne se font qu'à l'état "RegisteringVoters"
  it("...l'état du smart contract doit être RegisteringVoters pour enregistrer les votants", async function () {
    votingInstance.startProposalsRegistering({ from: admin });
    await expectRevert(
      votingInstance.addVoter(voter1, { from: admin }),
      "Voters registration is not open yet"
    );
  });

  // Enregistrement d'une proposition par un voteur
  it("...ajout d'une proposition par le voter1", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await votingInstance.startProposalsRegistering({ from: admin });
    const propositionVoter1 = await votingInstance.addProposal(
      proposalDescription1,
      { from: voter1 }
    );
    const getterPropositionVoter1 = await votingInstance.getOneProposal(0, {
      from: voter1,
    });
    expect(getterPropositionVoter1.description).to.equal(proposalDescription1);
    expectEvent(propositionVoter1, "ProposalRegistered", {
      proposalId: new BN(0),
    });
  });

  // Seuls les électeurs enregistrés peuvent envoyer leurs propositions
  it("...Seuls les voteurs enregistrés peuvent donner une proposition", async function () {
    await votingInstance.startProposalsRegistering({ from: admin });
    await expectRevert(
      votingInstance.addProposal(proposalDescription1, { from: intrus }),
      "You're not a voter"
    );
  });

  // L'état du contract doit être "ProposalsRegistrationStarted"
  it("...Propositions enregistrés à l'état ProposalsRegistrationStarted", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await votingInstance.startProposalsRegistering({ from: admin });
    await votingInstance.endProposalsRegistering({ from: admin });
    await expectRevert(
      votingInstance.addProposal(proposalDescription1, { from: voter1 }),
      "Proposals are not allowed yet"
    );
  });

  // Seul l'admin lance la session de vote
  it("...Seul l'admin lance la session de vote", async function () {
    await votingInstance.startProposalsRegistering();
    await votingInstance.endProposalsRegistering();
    await expectRevert(
      votingInstance.startVotingSession({ from: voter1 }),
      "Ownable: caller is not the owner"
    );
  });

  // démarrage du vote
  it("...ouverture d'une session de vote", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await votingInstance.startProposalsRegistering({ from: admin });
    await votingInstance.addProposal(proposalDescription1, { from: voter1 });
    await votingInstance.endProposalsRegistering({ from: admin });
    await votingInstance.startVotingSession({ from: admin });
    const aVote = await votingInstance.setVote(0, { from: voter1 });
    const voter = await votingInstance.getVoter(voter1, { from: voter1 });
    const propositionVoter1 = await votingInstance.getOneProposal(0, {
      from: voter1,
    });
    expect(voter.votedProposalId).to.be.equal("0");
    expect(voter.hasVoted).to.be.equal(true);
    expect(propositionVoter1.description).to.be.equal(proposalDescription1);
    expect(propositionVoter1.voteCount).to.be.equal("1");
    expectEvent(aVote, "Voted", { voter: voter1, proposalId: new BN(0) });
  });

  // Un non-élécteur ne peut pas voter
  it("...Le vote d'un intrus n'est pas pris en compte", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await votingInstance.startProposalsRegistering({ from: admin });
    await votingInstance.addProposal(proposalDescription1, { from: voter1 });
    await votingInstance.endProposalsRegistering({ from: admin });
    await votingInstance.startVotingSession({ from: admin });
    await expectRevert(
      votingInstance.setVote(0, { from: intrus }),
      "You're not a voter"
    );
  });

  // Le vote s'ouvre lorsque l'état du contrat est "VotingSessionStarted"
  it("...session de vote ouverte à l'état VotingSessionStarted", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await expectRevert(
      votingInstance.setVote(0, { from: voter1 }),
      "Voting session havent started yet"
    );
  });

  // Un vote unique par électeur
  it("...Un élécteur ne vote qu'une seule fois", async function () {
    await votingInstance.addVoter(voter1, { from: admin });
    await votingInstance.startProposalsRegistering({ from: admin });
    await votingInstance.addProposal(proposalDescription1, { from: voter1 });
    await votingInstance.endProposalsRegistering({ from: admin });
    await votingInstance.startVotingSession({ from: admin });
    await votingInstance.setVote(0, { from: voter1 });
    await expectRevert(
      votingInstance.setVote(0, { from: voter1 }),
      "You have already voted"
    );
  });
});
