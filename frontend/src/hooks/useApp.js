import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { MyEpicNftABI } from "../libs";

const RINKEBY_CHAIN_ID = "0x4";
// NOTE: contract デプロイ毎に更新させる
const CONTRACT_ADDRESS = "0x6D8030B8Dd0E53ACd18239d0b641FE2553C7491c";

export const useApp = () => {
  const [lastTokenId, setLastTokenId] = useState(0);
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentChainId, setCurrentChainId] = useState("");
  const [isRinkebyTestNetwork, setRinkebyTestNetwork] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    // initial check
    const chainId = await ethereum.request({ method: "eth_chainId" });
    const isRinkByChainId = chainId === RINKEBY_CHAIN_ID;
    setRinkebyTestNetwork(isRinkByChainId);
    if (!ethereum) {
      alert("Make sure you have MetaMask!");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      alert("No authorized account found");
    }
  };

  useEffect(() => {
    if (!currentChainId) return;
    const isRinkByChainId = currentChainId === RINKEBY_CHAIN_ID;
    setRinkebyTestNetwork(isRinkByChainId);
  }, [currentChainId]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // ウォレットアドレスに対してアクセスをリクエスト
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNftABI.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    const { ethereum } = window;
    if (!ethereum) return;
    const setChainId = (chainId) => {
      setCurrentChainId(chainId);
    };
    ethereum.on("chainChanged", setChainId);
    return () => ethereum.off("chainChanged", setChainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum || !currentAccount) return;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyEpicNftABI.abi,
      signer
    );

    if (!connectedContract) return;

    // mint 後に emit された NewEpicNFTMinted から値を受け取る
    const handleEmitEvent = (from, tokenId) => {
      setLastTokenId(tokenId.toNumber());
      console.log(from, tokenId.toNumber());
      alert(
        `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      );
    };
    connectedContract.on("NewEpicNFTMinted", handleEmitEvent);
    return () => connectedContract.off("NewEpicNFTMinted", handleEmitEvent);
  }, [currentAccount]);

  return {
    lastTokenId,
    isRinkebyTestNetwork,
    currentAccount,
    connectWallet,
    askContractToMintNft,
  };
};
