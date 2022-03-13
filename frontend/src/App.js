import React, { useMemo } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { loadingGIf } from "./assets";
import { useApp } from "./hooks/useApp";
import {
  CONTRACT_ADDRESS,
  TWITTER_HANDLE,
  TWITTER_LINK,
  MAX_SUPPLY,
} from "./constants";

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
          {showOpenSeaLinkCondition && (
            <>
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
              <p className="desc-text"> - or -</p>
            </>
          )}
          {showMintCondition && (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              {showOpenSeaLinkCondition ? "Mint NFT more" : "Mint NFT"}
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
        <p className="sub-text">{`${
          lastTokenId === 0 ? "x" : lastTokenId
        }/${MAX_SUPPLY}`}</p>
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
