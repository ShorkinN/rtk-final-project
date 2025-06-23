import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("YourContract", function () {
  let contract: YourContract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const listingPrice = ethers.parseEther("0.0025");
  const tokenURI = "https://example.com/token/1";
  const tokenPrice = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const yourContractFactory = await ethers.getContractFactory("YourContract");
    contract = await yourContractFactory.deploy(owner.address);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set the correct listing price", async function () {
      expect(await contract.getListingPrice()).to.equal(listingPrice);
    });

    it("Should have correct name and symbol", async function () {
      expect(await contract.name()).to.equal("My Super Token");
      expect(await contract.symbol()).to.equal("MSTK");
    });
  });

  describe("Listing Price", function () {
    it("Should allow owner to update listing price", async function () {
      const newPrice = ethers.parseEther("0.003");
      await contract.connect(owner).setListingPrice(newPrice);
      expect(await contract.getListingPrice()).to.equal(newPrice);
    });

    it("Should prevent non-owners from updating listing price", async function () {
      const newPrice = ethers.parseEther("0.003");
      await expect(contract.connect(addr1).setListingPrice(newPrice)).to.be.revertedWith(
        "Only owner can access this function",
      );
    });
  });

  describe("Token Creation", function () {
    it("Should create a new token and market item", async function () {
      const contractAddress = await contract.getAddress();

      await expect(
        contract.connect(addr1).createToken(tokenURI, tokenPrice, {
          value: listingPrice,
        }),
      )
        .to.emit(contract, "MarketItemCreated")
        .withArgs(1, addr1.address, contractAddress, tokenPrice, false);

      const marketItems = await contract.getMarketItems();
      expect(marketItems.length).to.equal(1);
      expect(marketItems[0].tokenId).to.equal(1);
      expect(marketItems[0].seller).to.equal(addr1.address);
      expect(marketItems[0].owner).to.equal(contractAddress);
      expect(marketItems[0].price).to.equal(tokenPrice);
      expect(marketItems[0].sold).to.equal(false);
    });

    it("Should fail if listing price is not paid", async function () {
      await expect(contract.connect(addr1).createToken(tokenURI, tokenPrice)).to.be.revertedWith(
        "Value should be equal to listing price",
      );
    });

    it("Should fail if price is zero", async function () {
      await expect(
        contract.connect(addr1).createToken(tokenURI, 0, {
          value: listingPrice,
        }),
      ).to.be.revertedWith("Price cannot be less than 0!");
    });
  });

  describe("Market Sale", function () {
    beforeEach(async function () {
      await contract.connect(addr1).createToken(tokenURI, tokenPrice, {
        value: listingPrice,
      });
    });

    it("Should allow buying a token", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1);

      await contract.connect(addr2).buyToken(1, {
        value: tokenPrice,
      });

      const marketItems = await contract.getMarketItems();
      expect(marketItems.length).to.equal(0);

      const myNFTs = await contract.connect(addr2).getUserTokens();
      expect(myNFTs.length).to.equal(1);
      expect(myNFTs[0].owner).to.equal(addr2.address);
      expect(myNFTs[0].sold).to.equal(true);

      // Check if seller received the funds (minus gas costs)
      const finalBalance = await ethers.provider.getBalance(addr1);
      expect(finalBalance > initialBalance).to.equal(true);
    });

    it("Should fail if incorrect price is paid", async function () {
      await expect(
        contract.connect(addr2).buyToken(1, {
          value: ethers.parseEther("0.05"),
        }),
      ).to.be.revertedWith("Value should be equal to token price");
    });
  });

  describe("Reselling", function () {
    const newPrice = ethers.parseEther("0.2");

    beforeEach(async function () {
      await contract.connect(addr1).createToken(tokenURI, tokenPrice, {
        value: listingPrice,
      });
      await contract.connect(addr2).buyToken(1, {
        value: tokenPrice,
      });
    });

    it("Should allow owner to resell token", async function () {
      const contractAddress = await contract.getAddress();
      await contract.connect(addr2).resellToken(1, newPrice, {
        value: listingPrice,
      });

      const marketItems = await contract.getMarketItems();
      expect(marketItems.length).to.equal(1);
      expect(marketItems[0].tokenId).to.equal(1);
      expect(marketItems[0].seller).to.equal(addr2.address);
      expect(marketItems[0].owner).to.equal(contractAddress);
      expect(marketItems[0].price).to.equal(newPrice);
      expect(marketItems[0].sold).to.equal(false);
    });

    it("Should fail if non-owner tries to resell", async function () {
      await expect(
        contract.connect(addr1).resellToken(1, newPrice, {
          value: listingPrice,
        }),
      ).to.be.revertedWith("Only the item owner can resell token");
    });

    it("Should fail if listing price is not paid", async function () {
      await expect(contract.connect(addr2).resellToken(1, newPrice)).to.be.revertedWith(
        "Value should be equal to listing price",
      );
    });
  });

  describe("Fetching Items", function () {
    beforeEach(async function () {
      // Create 3 tokens by different users
      await contract.connect(addr1).createToken(tokenURI, tokenPrice, {
        value: listingPrice,
      });
      await contract.connect(addr2).createToken(tokenURI, tokenPrice, {
        value: listingPrice,
      });
      await contract.connect(addr1).createToken(tokenURI, tokenPrice, {
        value: listingPrice,
      });

      // Buy one token (tokenId 2)
      await contract.connect(addr1).buyToken(2, {
        value: tokenPrice,
      });
    });

    it("Should fetch all unsold market items", async function () {
      const marketItems = await contract.getMarketItems();
      expect(marketItems.length).to.equal(2);
      expect(marketItems[0].tokenId).to.equal(1);
      expect(marketItems[1].tokenId).to.equal(3);
    });

    it("Should fetch NFTs owned by a user", async function () {
      const myNFTs = await contract.connect(addr1).getUserTokens();
      expect(myNFTs.length).to.equal(1);
      expect(myNFTs[0].tokenId).to.equal(2);
      expect(myNFTs[0].owner).to.equal(addr1.address);
    });

    it("Should fetch items listed by a user", async function () {
      const listedItems = await contract.connect(addr1).getUserListedTokens();
      expect(listedItems.length).to.equal(2);
      expect(listedItems[0].tokenId).to.equal(1);
      expect(listedItems[1].tokenId).to.equal(3);
    });
  });
});
