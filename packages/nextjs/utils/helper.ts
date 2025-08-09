import * as xlsx from "xlsx";
import { UserDataProps } from "~~/components/ui/usertable";

export const splitDecimal = (amount: number, type: "full" | "decimal") => {
  const [full, decimal] = amount.toString().split(".");

  return type === "full" ? full.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : decimal;
};

export const flatten2D = (data: string[][]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, ...rest] = data;
  const idk: UserDataProps[] = rest.map(([walletAddress, status]) => ({
    walletAddress,
    status: status as "active" | "inactive",
  }));

  return idk;
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

// local storage stuff, because no db :(
const STORAGE_KEY = "userDataList";

export const loadUserData = (): UserDataProps[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  const generated = Array.from({ length: 15 }, () => ({
    walletAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    status: (Math.random() > 0.5 ? "active" : "inactive") as "active" | "inactive",
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
  return generated;
};

export const saveUserData = (data: UserDataProps[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearUserData = () => {
  localStorage.clear();
};

// excel sheet stuff
export const convertToJSON = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData); // resolve with parsed data
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsBinaryString(file); // start reading the file
  });
};
