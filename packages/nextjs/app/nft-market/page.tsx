import NftMarketComponent from "./_components/NftMarketComponent";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Nft Market",
  description: "Try to add own component to app",
});

const NftMarket: NextPage = () => {
  return (
    <>
      <NftMarketComponent />
    </>
  );
};

export default NftMarket;
