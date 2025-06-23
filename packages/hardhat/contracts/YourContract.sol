//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract YourContract is ERC721URIStorage {
    uint256 private _tokenIds;
    uint256 private _itemsSold;

    address payable public owner;

    uint256 listingPrice = 0.0025 ether;

    mapping(uint256 => MarketItem) private _idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isListed;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool isListed
    );

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can access this function");
        _;
    }

    constructor(address _owner) ERC721("My Super Token", "MSTK") {
        owner = payable(_owner);
    }

    function setListingPrice(uint256 _listingPrice) public onlyOwner {
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns(uint256) {
        return listingPrice;
    }


    function createToken(string memory tokenURI, uint256 price) public payable returns (uint256) {
        require(msg.value == listingPrice, "Value should be equal to listing price");

        _tokenIds += 1;

        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price cannot be less than 0");

        _idToMarketItem[tokenId] = MarketItem(tokenId, payable(msg.sender), payable(address(this)), price, true);

        _transfer(msg.sender, address(this), tokenId);
        MarketItem memory newMarketItem = _idToMarketItem[tokenId];
        emit MarketItemCreated(newMarketItem.tokenId, newMarketItem.seller, newMarketItem.owner, newMarketItem.price, newMarketItem.isListed);
    }

    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(_idToMarketItem[tokenId].owner == msg.sender, "Only the item owner can resell token");
        require(_idToMarketItem[tokenId].isListed == false, "Token already listed");
        require(msg.value == listingPrice, "Value should be equal to listing price");

        _idToMarketItem[tokenId].price = price;
        _idToMarketItem[tokenId].seller = payable(msg.sender);
        _idToMarketItem[tokenId].owner = payable(address(this));
        _idToMarketItem[tokenId].isListed = true;

        _itemsSold -= 1;

        _transfer(msg.sender, address(this), tokenId);
    }

    function buyToken(uint256 tokenId) public payable {
        require(_idToMarketItem[tokenId].isListed == true, "Token must be listed");
        uint256 price = _idToMarketItem[tokenId].price;
        require(msg.value == price, "Value should be equal to token price");

        _idToMarketItem[tokenId].owner = payable(msg.sender);
        _idToMarketItem[tokenId].isListed = false;

        _itemsSold += 1;
        _transfer(address(this), msg.sender, tokenId);
        _idToMarketItem[tokenId].seller.transfer(msg.value);
    }

    function getMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds;
        uint256 unSoldItemCount = _tokenIds - _itemsSold;

        uint256 currentIndex = 0;
        MarketItem[] memory items = new MarketItem[](unSoldItemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            if (_idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = _idToMarketItem[currentId];

                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getUserTokens() public view returns (MarketItem[] memory) {
        uint256 totalCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (_idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        console.log("Fetch my NFTs '%s'", msg.sender);
        MarketItem[] memory items = new MarketItem[](itemCount);
        console.log("Total my NFTs '%i'", itemCount);

        for (uint256 i = 0; i < totalCount; i++) {
            if (_idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = _idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        console.log("Total my NFTs currindex'%i'", currentIndex);
        return items;
    }

    function getUserListedTokens() public view returns (MarketItem[] memory) {
        uint256 totalCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (_idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalCount; i++) {
            if (_idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = _idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}