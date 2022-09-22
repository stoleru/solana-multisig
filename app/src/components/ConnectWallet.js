const ConnectWallet = ({ onBtnClick }) => {
    return (
        <button
            className="cta-button connect-wallet-button"
            onClick={onBtnClick}
        >
            <span> Connect Wallet </span>
        </button>
    );
};

export default ConnectWallet;