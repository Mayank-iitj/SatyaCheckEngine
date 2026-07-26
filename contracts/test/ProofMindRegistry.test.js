const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SatyaCheckRegistry", function () {
  let registry;
  let owner;
  let institution;
  let otherAccount;
  let student;

  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("sample-credential-data"));
  const sampleHash2 = ethers.keccak256(ethers.toUtf8Bytes("sample-credential-data-2"));
  const metadataURI = "ipfs://QmSampleHash123456789";
  const institutionName = "MIT Demo University";

  beforeEach(async function () {
    [owner, institution, otherAccount, student] = await ethers.getSigners();
    const SatyaCheckRegistry = await ethers.getContractFactory("SatyaCheckRegistry");
    registry = await SatyaCheckRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("should start with zero credentials and institutions", async function () {
      expect(await registry.totalCredentials()).to.equal(0);
      expect(await registry.totalInstitutions()).to.equal(0);
    });
  });

  describe("Institution Registration", function () {
    it("should allow owner to register an institution", async function () {
      await expect(registry.registerInstitution(institution.address, institutionName))
        .to.emit(registry, "InstitutionRegistered")
        .withArgs(institution.address, institutionName, await getBlockTimestamp());

      expect(await registry.registeredInstitutions(institution.address)).to.be.true;
      expect(await registry.totalInstitutions()).to.equal(1);
    });

    it("should reject non-owner registration", async function () {
      await expect(
        registry.connect(otherAccount).registerInstitution(institution.address, institutionName)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("should reject duplicate registration", async function () {
      await registry.registerInstitution(institution.address, institutionName);
      await expect(
        registry.registerInstitution(institution.address, institutionName)
      ).to.be.revertedWith("SatyaCheck: institution already registered");
    });

    it("should reject zero address", async function () {
      await expect(
        registry.registerInstitution(ethers.ZeroAddress, institutionName)
      ).to.be.revertedWith("SatyaCheck: zero address");
    });

    it("should allow owner to remove an institution", async function () {
      await registry.registerInstitution(institution.address, institutionName);
      await expect(registry.removeInstitution(institution.address))
        .to.emit(registry, "InstitutionRemoved");

      expect(await registry.registeredInstitutions(institution.address)).to.be.false;
      expect(await registry.totalInstitutions()).to.equal(0);
    });
  });

  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await registry.registerInstitution(institution.address, institutionName);
    });

    it("should allow registered institution to issue a credential", async function () {
      await expect(
        registry.connect(institution).issueCredential(sampleHash, metadataURI)
      )
        .to.emit(registry, "CredentialIssued")
        .withArgs(sampleHash, institution.address, metadataURI, await getBlockTimestamp());

      expect(await registry.totalCredentials()).to.equal(1);
    });

    it("should reject issuance from non-institution", async function () {
      await expect(
        registry.connect(otherAccount).issueCredential(sampleHash, metadataURI)
      ).to.be.revertedWith("SatyaCheck: caller is not a registered institution");
    });

    it("should reject duplicate credential hash", async function () {
      await registry.connect(institution).issueCredential(sampleHash, metadataURI);
      await expect(
        registry.connect(institution).issueCredential(sampleHash, metadataURI)
      ).to.be.revertedWith("SatyaCheck: credential already exists");
    });

    it("should reject empty hash", async function () {
      await expect(
        registry.connect(institution).issueCredential(ethers.ZeroHash, metadataURI)
      ).to.be.revertedWith("SatyaCheck: empty hash");
    });
  });

  describe("Batch Issuance", function () {
    beforeEach(async function () {
      await registry.registerInstitution(institution.address, institutionName);
    });

    it("should allow batch issuance of multiple credentials", async function () {
      const hashes = [sampleHash, sampleHash2];
      const uris = [metadataURI, "ipfs://QmAnotherHash"];

      await registry.connect(institution).batchIssueCredentials(hashes, uris);
      expect(await registry.totalCredentials()).to.equal(2);
    });

    it("should reject mismatched array lengths", async function () {
      await expect(
        registry.connect(institution).batchIssueCredentials([sampleHash], [])
      ).to.be.revertedWith("SatyaCheck: arrays length mismatch");
    });

    it("should reject empty arrays", async function () {
      await expect(
        registry.connect(institution).batchIssueCredentials([], [])
      ).to.be.revertedWith("SatyaCheck: empty arrays");
    });
  });

  describe("Credential Revocation", function () {
    beforeEach(async function () {
      await registry.registerInstitution(institution.address, institutionName);
      await registry.connect(institution).issueCredential(sampleHash, metadataURI);
    });

    it("should allow issuer to revoke their credential", async function () {
      const reason = "Degree was obtained through academic misconduct";
      await expect(
        registry.connect(institution).revokeCredential(sampleHash, reason)
      )
        .to.emit(registry, "CredentialRevoked")
        .withArgs(sampleHash, institution.address, reason, await getBlockTimestamp());
    });

    it("should reject revocation by non-issuer", async function () {
      await expect(
        registry.connect(otherAccount).revokeCredential(sampleHash, "fake reason")
      ).to.be.revertedWith("SatyaCheck: only the issuer can revoke");
    });

    it("should reject revoking a non-existent credential", async function () {
      await expect(
        registry.connect(institution).revokeCredential(sampleHash2, "reason")
      ).to.be.revertedWith("SatyaCheck: credential not found");
    });

    it("should reject double revocation", async function () {
      await registry.connect(institution).revokeCredential(sampleHash, "reason");
      await expect(
        registry.connect(institution).revokeCredential(sampleHash, "again")
      ).to.be.revertedWith("SatyaCheck: already revoked");
    });
  });

  describe("Credential Verification", function () {
    beforeEach(async function () {
      await registry.registerInstitution(institution.address, institutionName);
      await registry.connect(institution).issueCredential(sampleHash, metadataURI);
    });

    it("should return correct data for a valid credential", async function () {
      const [exists, revoked, issuer, timestamp, uri] =
        await registry.verifyCredential(sampleHash);

      expect(exists).to.be.true;
      expect(revoked).to.be.false;
      expect(issuer).to.equal(institution.address);
      expect(timestamp).to.be.gt(0);
      expect(uri).to.equal(metadataURI);
    });

    it("should return exists=false for non-existent credential", async function () {
      const [exists] = await registry.verifyCredential(sampleHash2);
      expect(exists).to.be.false;
    });

    it("should show revoked status after revocation", async function () {
      await registry.connect(institution).revokeCredential(sampleHash, "test revoke");
      const [exists, revoked] = await registry.verifyCredential(sampleHash);
      expect(exists).to.be.true;
      expect(revoked).to.be.true;
    });
  });

  describe("Get Institution", function () {
    it("should return institution info for a registered address", async function () {
      await registry.registerInstitution(institution.address, institutionName);
      const [isRegistered, name] = await registry.getInstitution(institution.address);
      expect(isRegistered).to.be.true;
      expect(name).to.equal(institutionName);
    });

    it("should return false for unregistered address", async function () {
      const [isRegistered] = await registry.getInstitution(otherAccount.address);
      expect(isRegistered).to.be.false;
    });
  });
});

// Helper to get the next block timestamp (approximate)
async function getBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp + 1; // Next block estimate
}
