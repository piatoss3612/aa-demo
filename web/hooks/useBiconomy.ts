import { BiconomyContext } from "@/context/BiconomyContext";
import { useContext } from "react";

const useBiconomy = () => {
  return useContext(BiconomyContext);
};

export default useBiconomy;
