import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <div>
            <h1>Decentralized Lottery</h1>
            <ConnectButton moralisAuth={false} />
        </div>
    );
}
