
import { FC } from "react";
import { SignMessage } from '../../components/SignMessage';
import { SendTransaction } from '../../components/SendTransaction';
import { SendVersionedTransaction } from '../../components/SendVersionedTransaction';
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, Idl } from "@project-serum/anchor";
import idl from '../../idl/idl.json';
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

export const BasicsView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const provider = new anchor.AnchorProvider(connection, wallet, {});
const program = new Program(idl as Idl, new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1'), provider);
const USDC_MINT = new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1');
const [loanEscrowPk, bump] = findProgramAddressSync(
  [
      Buffer.from('token_lending'),
      Buffer.from(Uint8Array.of(1000)),
  ],
  new anchor.web3.PublicKey('5RpTBt4NiZMpbrAaMCNbFgnRax4iXbdD2qjgXzg49Hg1'),
)
  const createLoan = async () => {
    const tx = await program.methods
    .createLoan(new anchor.BN(100))
    .accounts({
      usdcMint: USDC_MINT,
      loanEscrowUsdcAta: await anchor.utils.token.associatedAddress({
        mint: USDC_MINT,
        owner: loanEscrowPk,
      }),
    })

  }


  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
          Basics
        </h1>
        {/* CONTENT GOES HERE */}
        <div className="text-center">
         <div>
          <h1>Create Loan</h1>
          <input className="">Amount in FUSD</input>

         </div>
        </div>
      </div>
    </div>
  );
};
