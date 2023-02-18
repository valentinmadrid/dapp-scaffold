// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import * as anchor from "@project-serum/anchor";
import { Program, Idl } from "@project-serum/anchor";
import idl from '../../idl/idl.json';
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";


// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { PublicKey } from '@solana/web3.js';


export const OpenLoansView: FC = ({ }) => {
  const SOL_USD_PRICE_FEED_ID = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");
  const USDC_MINT = new PublicKey("4HZCNvobxtDA3uezTGmDAEqVLp7oo73UrnbxNeUMszd4");
  const wallet = useWallet();
  const { connection } = useConnection();

  const provider = new anchor.AnchorProvider(connection, wallet, {});
const program = new Program(idl as Idl, new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1'), provider);

const [loans, setLoans] = useState<any>()

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const borrow = async (escrowPk: anchor.web3.PublicKey, loanId:number, lender: PublicKey) => {
    console.log(escrowPk.toBase58(), 'escrowPk')
    const loanNoteMint = anchor.web3.Keypair.generate();
    const loanNoteMintMetadata = PublicKey.findProgramAddressSync(
      [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          loanNoteMint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID,
  )
    const tx = await program.methods
    .acceptLoan(loanId)
    .accounts({
      usdcMint: USDC_MINT,
      loanNoteMint: loanNoteMint.publicKey,
      loanNoteMintMetadata: loanNoteMintMetadata[0],
      loanEscrow: escrowPk,
      loanEscrowUsdcAta: await anchor.utils.token.associatedAddress({
        mint: USDC_MINT,
        owner: escrowPk,
      }),
      borrower: wallet.publicKey,
      borrowerUsdcAta: await anchor.utils.token.associatedAddress({
        mint: USDC_MINT,
        owner: wallet.publicKey,
      }),
      lender: lender,
      lenderLoanNoteMintAta: await anchor.utils.token.associatedAddress({
        mint: loanNoteMint.publicKey,
        owner: lender,
      }),
      // pythAccount: SOL_USD_PRICE_FEED_ID,
      tokenMetadataProgram: METADATA_PROGRAM_ID,
  
    })
    .signers([loanNoteMint])
    .rpc();
    console.log("Borrowed", tx);
  };

  useEffect(() => {
    const fetchLoans = async () => {
    console.log('fetching loans')
    const loans = await program.account.loanEscrow.all();
    setLoans(loans)

    console.log(loans, 'loans')
    }
    fetchLoans()
  }, [])
    

  

  

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
          Outstanding loans
        </h1>
        </div>
        <div className="grid grid-cols-4 gap-4">
          { loans &&
loans.map((loan) => (
 
  <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Loan ID: {loan.account.loanId}</h5>
    </a>
    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{parseInt(loan.account.deposit)} USDC</p>
    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{parseInt(loan.account.expiryTimestamp)} Expiry</p>
    <button onClick={(e) => borrow(loan.publicKey, loan.account.loanId, loan.account.lender)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Borrow
        <svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
    <a href="#" className="inline-flex mt-3 ml-2 items-center px-3 py-2 text-sm font-medium text-center text-white bg-purple-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Explorer
        <svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </a>
</div>
                    ))}




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
