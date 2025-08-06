import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import CustomStatusChip from "./chip";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export type TableProps = {
  data: {
    id: string;
    date: Date;
    coin: {
      name: string;
      icon: ImageProps;
    };
    merchant: string;
    amount: number;
    type: "receive" | "pay";
    status: "completed" | "pending" | "failed";
  };
};

export const exampleTableData: TableProps[] = [
  {
    data: {
      id: "1",
      date: new Date("2025-08-01T10:00:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Coinbase",
      amount: 120.5,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "2",
      date: new Date("2025-08-02T11:15:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Binance",
      amount: 45.0,
      type: "pay",
      status: "pending",
    },
  },
  {
    data: {
      id: "3",
      date: new Date("2025-08-03T08:30:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Kraken",
      amount: 300.75,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "4",
      date: new Date("2025-08-04T09:00:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "OKX",
      amount: 87.9,
      type: "pay",
      status: "failed",
    },
  },
  {
    data: {
      id: "5",
      date: new Date("2025-08-05T12:00:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Gemini",
      amount: 210.0,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "6",
      date: new Date("2025-08-06T14:00:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Bybit",
      amount: 160.25,
      type: "pay",
      status: "pending",
    },
  },
  {
    data: {
      id: "7",
      date: new Date("2025-08-07T16:00:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "KuCoin",
      amount: 74.4,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "8",
      date: new Date("2025-08-08T13:30:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Bitfinex",
      amount: 95.0,
      type: "pay",
      status: "failed",
    },
  },
  {
    data: {
      id: "9",
      date: new Date("2025-08-09T15:20:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Crypto.com",
      amount: 180.33,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "10",
      date: new Date("2025-08-10T09:45:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "MoonPay",
      amount: 33.1,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "11",
      date: new Date("2025-08-11T10:05:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Simplex",
      amount: 250.0,
      type: "pay",
      status: "pending",
    },
  },
  {
    data: {
      id: "12",
      date: new Date("2025-08-12T11:25:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Ramp",
      amount: 410.2,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "13",
      date: new Date("2025-08-13T12:15:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Transak",
      amount: 12.99,
      type: "pay",
      status: "failed",
    },
  },
  {
    data: {
      id: "14",
      date: new Date("2025-08-14T14:50:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Binance US",
      amount: 99.99,
      type: "pay",
      status: "completed",
    },
  },
  {
    data: {
      id: "15",
      date: new Date("2025-08-15T17:30:00Z"),
      coin: {
        name: "USDC",
        icon: { src: "", alt: "USDC icon", width: 24, height: 24 },
      },
      merchant: "Robinhood",
      amount: 135.0,
      type: "pay",
      status: "completed",
    },
  },
];

const DarkTableContainer = styled(TableContainer)(() => ({
  backgroundColor: "#141414",
  borderRadius: 12,
}));

const CustomTableCell = styled(TableCell)(() => ({
  color: "#8c8c8c",
  borderBottom: "1px solid #333",
  fontSize: 18,
  // borderLeft: "1px solid #333",
  // borderRight: "1px solid #333",
}));

const CoinTable = () => {
  const [page, setPage] = useState<number>(0);
  const rowCount = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const paginatedData = exampleTableData.slice(page * rowCount, page * rowCount + rowCount);

  return (
    <DarkTableContainer component={Paper} sx={{ padding: 2, minWidth: 700 }}>
      <p className="p-4 font-bold text-2xl">Payment History</p>
      <Table>
        <TableHead>
          <TableRow>
            <CustomTableCell>ID & Date</CustomTableCell>
            <CustomTableCell>Coin</CustomTableCell>
            <CustomTableCell align="center">Merchant</CustomTableCell>
            <CustomTableCell align="center">Amount</CustomTableCell>
            <CustomTableCell align="center">Status</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map(({ data }) => (
            <TableRow key={data.id}>
              <CustomTableCell>
                <div className="flex flex-col gap-1">
                  <p>REF #{data.id}</p>
                  <p>{data.date.toLocaleDateString()}</p>
                </div>
              </CustomTableCell>
              <CustomTableCell>
                <div className="flex gap-3 items-center">
                  <Image alt={data.coin.icon.alt} src={"/icons/usdc.svg"} width={30} height={30} />
                  <p className="font-bold">{data.coin.name}</p>
                </div>
              </CustomTableCell>
              <CustomTableCell align="center">{data.merchant}</CustomTableCell>
              <CustomTableCell align="center">
                <p
                  className={data.type === "receive" ? "text-green-500" : "text-[#FF4D49]"}
                >{`${data.type === "receive" ? "+" : "-"} $${data.amount.toFixed(2)}`}</p>
              </CustomTableCell>
              <CustomTableCell align="center">
                <Box display="flex" justifyContent="center">
                  <CustomStatusChip status={data.status} />
                </Box>
              </CustomTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={exampleTableData.length}
        rowsPerPage={rowCount}
        page={page}
        onPageChange={handleChangePage}
      />
    </DarkTableContainer>
  );
};

export default CoinTable;
