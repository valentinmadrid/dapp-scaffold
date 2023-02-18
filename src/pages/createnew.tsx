import type { NextPage } from "next";
import Head from "next/head";
import { CreateNewView } from "views/createnew";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Solana Scaffold"
        />
      </Head>
      <CreateNewView />
    </div>
  );
};

export default Home;
