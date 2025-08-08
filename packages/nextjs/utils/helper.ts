import { UserDataProps } from "~~/components/ui/usertable";

export const splitDecimal = (amount: number, type: "full" | "decimal") => {
  const [full, decimal] = amount.toString().split(".");

  return type === "full" ? full.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : decimal;
};

export const generateUserList = () => {
  const userDataSets: UserDataProps[] = [];

  for (let i = 1; i <= 15; i++) {
    const walletAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    const status = Math.random() > 0.5 ? "active" : "inactive";

    userDataSets.push({ walletAddress, status });
  }

  return userDataSets;
};
