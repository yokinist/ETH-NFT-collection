import React from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { useApp } from "./hooks/useApp";

const TWITTER_HANDLE = "yokinist";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const MINT_LIMIT_COUNT = 100;

const App = () => {
  const {
    lastTokenId,
    isRinkebyTestNetwork,
    connectWallet,
    currentAccount,
    askContractToMintNft,
  } = useApp();

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {currentAccount === "" && isRinkebyTestNetwork && (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          )}
          {currentAccount !== "" && isRinkebyTestNetwork && (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
          {!isRinkebyTestNetwork && (
            <p className="sub-text">
              Rinkeby Test Network に切り替えてください
            </p>
          )}
        </div>
        <p className="sub-text">{`${lastTokenId}/${MINT_LIMIT_COUNT}`}</p>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
