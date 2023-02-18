// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import * as anchor from "@project-serum/anchor";
import { Program, Idl } from "@project-serum/anchor";
import idl from '../../idl/idl.json';


// Wallet
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { PublicKey, Transaction } from '@solana/web3.js';




export const CreateNewView: FC = ({ }) => {
  
  const wallet = useWallet();
  const { connection } = useConnection();
  const [depositAmount, setDepositAmount] = useState(0);
  const [loanId, setLoanId] = useState(0);

  const provider = new anchor.AnchorProvider(connection, wallet, {});
const program = new Program(idl as Idl, new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1'), provider);

const LOAN_ESCROW_SEED_PREFIX = "loan_escrow";
 const SOL_USD_PRICE_FEED_ID = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");
const USDC_MINT = new PublicKey("4HZCNvobxtDA3uezTGmDAEqVLp7oo73UrnbxNeUMszd4");
  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()



  const createNewLoan = async () => {
    console.log(wallet, 'wallet', wallet.publicKey, 'wallet.publicKey.toBase58()')
   
    const [escrowPk, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(LOAN_ESCROW_SEED_PREFIX),
            Buffer.from(Uint8Array.of(loanId)),
        ],
        new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1'),
    )

    console.log(escrowPk, 'escrowPk')
    const expiryTimestamp = new anchor.BN(
        (await program.provider.connection.getSlot()) + 300
      );
  
      const ix = await program.methods.createLoan(
        new anchor.BN(loanId), new anchor.BN(depositAmount * 1000000000), expiryTimestamp
      )
        .accounts({
          usdcMint: USDC_MINT,
          loanEscrow: escrowPk,
          loanEscrowUsdcAta: await anchor.utils.token.associatedAddress({
            mint: USDC_MINT,
            owner: escrowPk,
          }),
          lender: wallet.publicKey,
          lenderUsdcAta: await anchor.utils.token.associatedAddress({
            mint: USDC_MINT,
            owner: wallet.publicKey,
          }),
        })
        .rpc()


  };


  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
          Create new loan
        </h1>
        </div>
<div>
    <input className='h-10 w-full bg-red-500' placeholder='Amount in USDC' onChange={(e) => setDepositAmount(Number(e.target.value))}/>
    <input className='h-10 w-full bg-red-500' placeholder='Loan ID' onChange={(e) => setLoanId(Number(e.target.value))}/>
    <button className='h-10 w-full bg-blue-500' onClick={() => createNewLoan()}>Create new loan</button>
</div>
        <div className="flex flex-col mt-2">
          <RequestAirdrop />
          <h4 className="md:w-full text-2xl text-slate-300 my-2">
          {wallet &&
          <div className="flex flex-row justify-center">
            <div>
              {(balance || 0).toLocaleString()}
              </div>
              <div className='text-slate-600 ml-2'>
                SOL
              </div>
          </div>
          }
          </h4>
        </div>
      </div>
    </div>
  );
};
