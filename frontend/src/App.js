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
          <h2 className="header heading-text">Crypto Jiro</h2>
          <p className="sub-text">
            【限定100杯】ボタンを押して二郎のコールを NFT にしてみよう
          </p>
          {!!(currentAccount === "" && isRinkebyTestNetwork) && (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          )}
          {!!showOpenSeaLinkCondition && (
            <>
              <div className="desc-container">
                <a
                  href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${lastTokenId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="cta-button connect-wallet-button">
                    ミントした二郎コール NFT を見にいく
                  </button>
                </a>
              </div>
              <p className="desc-text"> - or -</p>
            </>
          )}
          {!!showMintCondition && (
            <>
              <p className="desc-text">今すぐ 0.001 ETH で</p>
              <button
                onClick={askContractToMintNft}
                className="cta-button connect-wallet-button"
              >
                {showOpenSeaLinkCondition ? "もう一杯おかわり" : "コールする"}
              </button>
            </>
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
            <p className="loading-text">調理中...</p>
          </>
        )}
      </div>
      <div className="footer-container">
        <div className="progress-container">
          <p className="sub-text">{`${
            lastTokenId === 0 ? "x" : lastTokenId
          }/${MAX_SUPPLY}`}</p>
          <div className="progress" style={{ width: `${lastTokenId}%` }}>
            🍜
          </div>
        </div>
        <div className="twitter-container">
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
