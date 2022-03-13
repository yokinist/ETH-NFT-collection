import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { MyEpicNftABI } from "../libs";
import { MINT_PRICE, RINKEBY_CHAIN_ID, CONTRACT_ADDRESS } from "../constants";
import { useLocalStorage } from "./useLocalStorage";

export const useApp = () => {
  const [lastTokenId, setLastTokenId] = useState(0);
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentChainId, setCurrentChainId] = useState("");
  const [isRinkebyTestNetwork, setRinkebyTestNetwork] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [myLatestTokenId, setMyLatestTokenId] = useState();
  const [myLSLatestTokenId, setMyLSLatestTokenId] = useLocalStorage(
    "myLatestTokenId",
    myLatestTokenId
  );

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
        let nftTxn = await connectedContract.makeAnEpicNFT({
          value: ethers.utils.parseEther(MINT_PRICE),
        });
        setInProgress(true);
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://rinkeby.etherscmian.io/tx/${nftTxn.hash}`
        );
        setLastTokenId((prevLastTokenId) => prevLastTokenId + 1);
        setInProgress(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetLastTokenId = async (connectedContract) => {
    const id = await connectedContract.getLastTokenId();
    if (!id) return;
    setLastTokenId(id.toNumber() - 1);
  };

  useEffect(() => {
    if (!myLSLatestTokenId) return;
    setMyLatestTokenId(myLSLatestTokenId);
  }, [myLSLatestTokenId]);

  useEffect(() => {
    if (!currentChainId) return;
    const isRinkByChainId = currentChainId === RINKEBY_CHAIN_ID;
    setRinkebyTestNetwork(isRinkByChainId);
  }, [currentChainId]);

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

    if (!connectedContract || !isRinkebyTestNetwork) return;

    handleGetLastTokenId(connectedContract);
    // mint 後に emit された NewEpicNFTMinted から値を受け取る
    const handleEmitEvent = (_from, tokenId) => {
      setMyLatestTokenId(tokenId.toNumber());
      setMyLSLatestTokenId(tokenId.toNumber());
    };
    connectedContract.on("NewEpicNFTMinted", handleEmitEvent);
    return () => connectedContract.off("NewEpicNFTMinted", handleEmitEvent);
  }, [currentAccount, isRinkebyTestNetwork, setMyLSLatestTokenId]);

  return {
    inProgress,
    myLatestTokenId,
    lastTokenId,
    isRinkebyTestNetwork,
    currentAccount,
    connectWallet,
    askContractToMintNft,
  };
};
