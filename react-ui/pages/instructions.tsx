import type { NextPage } from "next";
import { useEffect } from "react";
import Instructions from "../components/Instructions";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";

const Home: NextPage = () => {
  return (
    <>
      <Instructions />
    </>
  );
};

export default Home;
