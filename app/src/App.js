import React,{ useEffect, useState } from "react";
import {Buffer} from 'buffer';
import idl from './idl.json' //copy from target folder inside idl.json
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import ConnectWallet from "./components/ConnectWallet";
import AddForm from "./components/AddForm";
import Multisig from "./components/Multisig";
import "./App.css";

window.Buffer = Buffer
const programID = new PublicKey(idl.metadata.address)
const { Keypair } = web3;

const App = () => {
  const [ walletAddress, setWalletAddress ] = useState("");
  const [ loading, setLoading] = useState(false)
  const [ multisigs, setMultisigs ] = useState(['DiWnPDV4tSHaGQmCyNtjP5WBRS3MGECRVk3cRwgUb2HR'])

  const getProvider = () => {
    //Creating a provider, the provider is authenication connection to solana
    const opts = {
      preflightCommitment:"processed",
    }
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const program = new Program(idl, programID, getProvider())

  useEffect(() => {
    const onLoad = () => {
      checkIfWalletConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const checkIfWalletConnected = async () => {
    const { solana } = window;
    try {
		setLoading(true)
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phatom is connected!");
          const response = await solana.connect({
            onlyIfTrusted: true, //second time if anyone connected it won't show anypop on screen
          });
          setWalletAddress(response.publicKey.toString());
          console.log("Public key of wallet: ", response.publicKey.toString());
        }
      }
    } catch (err) {
      console.log(err);
    }finally{
		setLoading(false)
	}
  };

  const createMultisig = async(_threshold, _owners) =>{
    try{
      setLoading(true)
      const multisig = Keypair.generate()
      const [ nonce ] =
        await PublicKey.findProgramAddress(
          [multisig.publicKey.toBuffer()],
          programID
        );
      const multisigSize = 200; // Big enough.

      const owners = _owners.map(owner => new PublicKey(owner));
      const threshold = new BN(_threshold);

      await program.rpc.createMultisig(owners, threshold, nonce, {
        accounts: {
          multisig: multisig.publicKey,
        },
        instructions: [
          await program.account.multisig.createInstruction(
            multisig,
            multisigSize
          ),
        ],
        signers: [multisig],
      });
      alert("Done")
      setMultisigs([...multisigs, multisig.publicKey])
    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  }

  const getMultisig = async (key) => {
    let multisigAccount = await program.account.multisig.fetch(key);

    return multisigAccount
  }

  const approveTransaction = async (multisig, transaction) => {
    await program.rpc.approve({
      accounts: {
        multisig: multisig.publicKey,
        transaction: transaction.publicKey,
        owner: new PublicKey(walletAddress),
      },
      signers: [walletAddress],
    });
  }

  const createTransaction = async (multisig, to, amount) => {
    const transaction = Keypair.generate();
    const txSize = 1000;
    const data = program.coder.instruction.encode("create_transfer", {
      to: new PublicKey(to),
      amount
    });
    await program.rpc.createTransaction(programID, data, {
      accounts: {
        multisig: multisig.publicKey,
        transaction: transaction.publicKey,
        proposer: new PublicKey(walletAddress),
      },
      instructions: [
        await program.account.transaction.createInstruction(
          transaction,
          txSize
        ),
      ],
      signers: [transaction, walletAddress],
    });
  };

  const executeTransaction = async (multisig, transaction) => {
    const [ multisigSigner ] =
        await PublicKey.findProgramAddress(
          [multisig.publicKey.toBuffer()],
          programID
        );
    await program.rpc.executeTransaction({
      accounts: {
        multisig: multisig.publicKey,
        multisigSigner,
        transaction: transaction.publicKey,
      },
      remainingAccounts: program.instruction.setOwners
        .accounts({
          multisig: multisig.publicKey,
          multisigSigner,
        })
        // Change the signer status on the vendor signer since it's signed by the program, not the client.
        .map((meta) =>
          meta.pubkey.equals(multisigSigner)
            ? { ...meta, isSigner: false }
            : meta
        )
        .concat({
          pubkey: program.programId,
          isWritable: false,
          isSigner: false,
        }),
    });
  }

  const openConnectWallet = async () => {
    const { solana } = window;
    try{
      setLoading(true)
      if (solana) {
        const response = await solana.connect(); //to disconnect use "solana.disconnect()"
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Please Install Solana's Phantom Wallet");
      }
    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="App">
      <div>
        <h1>MultiSig Solana</h1>
        {!loading ? (
            !walletAddress ? (
            <ConnectWallet onBtnClick={openConnectWallet} />
            ) : (
              <>
                <AddForm onSubmit={createMultisig} />
                <hr />
                {multisigs.map(_m => {
                  let _mData = getMultisig(_m)
                  return <Multisig data={_mData} key={_m} account={_m} approve={approveTransaction} execute={executeTransaction} create={createTransaction} />
                })}
              </>
            )
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </div>
  );
};

export default App;