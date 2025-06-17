import ImageShopComponent from "./_components/ImageShopComponent";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Test Component",
  description: "Try to add own component to app",
});

const ImageShop: NextPage = () => {
  return (
    <>
      <ImageShopComponent />
    </>
  );
};

export default ImageShop;
