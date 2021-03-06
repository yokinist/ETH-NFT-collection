// MyEpicNFT.sol
// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;


import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";


import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    // _tokenIdsを初期化（_tokenIds = 0）: 状態変数として保持
    Counters.Counter private _tokenIds;

    uint public constant MAX_SUPPLY = 100;
    uint public constant PRICE = 0.001 ether;
    uint public constant MAX_PER_MINT = 3;
    string public constant baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='#d7cf3a'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = [unicode"小 - ", unicode"大 - ", unicode"小・麺少なめ - ", unicode"小・カタメ - ", unicode"大・カタメ - ", unicode"小・豚マシ - ", unicode"小・豚Wマシ - ", unicode"大・豚マシ - ", unicode"大・豚Wマシ - "];
    string[] secondWords = [unicode"アブラ - ", unicode"ヤサイ - ", unicode"カラメ - ", unicode"ニンニク - ", unicode"全部 - "];
    string[] thirdWords = [unicode"少なめ", unicode"マシ", unicode"マシマシ"];

    event NewEpicNFTMinted(address sender, uint256 tokenId);

    constructor() ERC721 ("Crypto Jiros", "JIRO") payable {
        console.log("This is my NFT contract.");
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
        // seed rand をターミナルに出力
        console.log("rand - seed: ", rand);
        // firstWords配列の長さを基準に、rand 番目の単語を取得
        rand = rand % firstWords.length;
        console.log("rand - first word: ", rand);
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    function getLastTokenId() public view returns (uint256) {
        uint256 lastTokenId = _tokenIds.current();
        return lastTokenId;
    }

    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }

    // mint
    function makeAnEpicNFT() public payable {
        uint256 newItemId = _tokenIds.current();

        if (MAX_SUPPLY < newItemId) return;
        require(
            msg.value >= PRICE,"Not enough ether to purchase NFTs."
        );

        // 3つの配列からそれぞれ1つの単語をランダムに取り出す
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);

        string memory combinedWord = string(abi.encodePacked(first, second, third));

        // 3つの単語を連結して svg 化
        string memory finalSvg = string(abi.encodePacked(baseSvg, first, second, third, "</text></svg>"));

        console.log("\n----- SVG data -----");
        console.log(finalSvg);
        console.log("--------------------\n");

        // JSONファイルを base64 としてエンコード
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combinedWord,
                        '", "description": "This is Crypto Jiro", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n----- Token URI ----");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        // カウンターをインクリメント
        _tokenIds.increment();

        // msg.sender を使って NFT を送信者に Mint
        _safeMint(msg.sender, newItemId);

        // tokenURI の更新
        _setTokenURI(newItemId, finalTokenUri);

        // NFT がいつ誰に作成されたかを確認
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        // emit for recieve valus from frontend
        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
}