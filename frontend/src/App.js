import React, { useMemo } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { loadingGIf } from "./assets";
import { CONTRACT_ADDRESS, useApp } from "./hooks/useApp";

const TWITTER_HANDLE = "yokinist";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const MINT_LIMIT_COUNT = 100;

const App = () => {
  const {
    inProgress,
    lastTokenId,
    isRinkebyTestNetwork,
    connectWallet,
    currentAccount,
    askContractToMintNft,
  } = useApp();

  const showMintCondition = useMemo(() => {
    return !inProgress && currentAccount !== "" && isRinkebyTestNetwork;
  }, [currentAccount, inProgress, isRinkebyTestNetwork]);

  const showOpenSeaLinkCondition = useMemo(() => {
    return !inProgress && lastTokenId;
  }, [inProgress, lastTokenId]);

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
          {showMintCondition && !showOpenSeaLinkCondition && (
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
        {inProgress && (
          <>
            <div className="loading-wrapper">
              <img
                className="loading-img"
                src={loadingGIf}
                alt=""
                decoding="async"
              />
            </div>
            <p className="loading-text">mining....</p>
          </>
        )}
        {showOpenSeaLinkCondition && (
          <div className="desc-container">
            <p className="desc-text">
              あなたのウォレットに NFT を送信しました。
              <br />
              OpenSea に表示されるまで最大で10分かかることがあります。
            </p>
            <a
              href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${lastTokenId}`}
              target="_blank"
              rel="noreferrer"
            >
              <button className="cta-button connect-wallet-button">
                OpenSea で見る
              </button>
            </a>
          </div>
        )}
        <p className="sub-text">{`${
          lastTokenId === 0 ? "x" : lastTokenId
        }/${MINT_LIMIT_COUNT}`}</p>
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
