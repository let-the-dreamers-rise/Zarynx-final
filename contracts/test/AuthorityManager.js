import { expect } from "chai";
import { network } from "hardhat";

describe("AuthorityManager", function () {
  async function deployFixture(ethers) {
    const [owner, agent, allowedTarget, blockedTarget] = await ethers.getSigners();
    const AuthorityManager = await ethers.getContractFactory("AuthorityManager");
    const authority = await AuthorityManager.deploy(
      owner.address,
      agent.address,
      ethers.parseEther("0.1"),
      [allowedTarget.address]
    );
    await authority.waitForDeployment();

    return { owner, agent, allowedTarget, blockedTarget, authority };
  }

  it("allows the configured agent to execute a whitelisted call within budget", async function () {
    const { ethers } = await network.connect();
    const { owner, agent, allowedTarget, authority } = await deployFixture(ethers);

    const depositTx = await owner.sendTransaction({
      to: await authority.getAddress(),
      value: ethers.parseEther("1"),
    });
    await depositTx.wait();

    const contractBalanceBefore = await ethers.provider.getBalance(await authority.getAddress());
    const targetBalanceBefore = await ethers.provider.getBalance(allowedTarget.address);

    const tx = await authority
      .connect(agent)
      .execute(allowedTarget.address, ethers.parseEther("0.05"), "0x", "fund-test", ethers.keccak256(ethers.toUtf8Bytes("1")));
    await tx.wait();

    const contractBalanceAfter = await ethers.provider.getBalance(await authority.getAddress());
    const targetBalanceAfter = await ethers.provider.getBalance(allowedTarget.address);

    expect(contractBalanceAfter).to.equal(contractBalanceBefore - ethers.parseEther("0.05"));
    expect(targetBalanceAfter).to.equal(targetBalanceBefore + ethers.parseEther("0.05"));
  });

  it("reverts when the amount exceeds the configured max spend", async function () {
    const { ethers } = await network.connect();
    const { owner, agent, allowedTarget, authority } = await deployFixture(ethers);

    const depositTx = await owner.sendTransaction({
      to: await authority.getAddress(),
      value: ethers.parseEther("1"),
    });
    await depositTx.wait();

    await expect(
      authority
        .connect(agent)
        .execute(allowedTarget.address, ethers.parseEther("0.5"), "0x", "too-much", ethers.keccak256(ethers.toUtf8Bytes("2")))
    ).to.be.revertedWithCustomError(authority, "AmountExceedsLimit");
  });

  it("reverts when the target is not whitelisted", async function () {
    const { ethers } = await network.connect();
    const { owner, agent, blockedTarget, authority } = await deployFixture(ethers);

    const depositTx = await owner.sendTransaction({
      to: await authority.getAddress(),
      value: ethers.parseEther("1"),
    });
    await depositTx.wait();

    await expect(
      authority
        .connect(agent)
        .execute(blockedTarget.address, ethers.parseEther("0.05"), "0x", "blocked", ethers.keccak256(ethers.toUtf8Bytes("3")))
    ).to.be.revertedWithCustomError(authority, "TargetNotAllowed");
  });

  it("reverts after revocation", async function () {
    const { ethers } = await network.connect();
    const { owner, agent, allowedTarget, authority } = await deployFixture(ethers);

    const depositTx = await owner.sendTransaction({
      to: await authority.getAddress(),
      value: ethers.parseEther("1"),
    });
    await depositTx.wait();

    await authority.connect(owner).revoke();

    await expect(
      authority
        .connect(agent)
        .execute(allowedTarget.address, ethers.parseEther("0.01"), "0x", "revoked", ethers.keccak256(ethers.toUtf8Bytes("4")))
    ).to.be.revertedWithCustomError(authority, "AuthorityInactive");
  });
});
