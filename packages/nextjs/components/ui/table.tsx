import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import CustomStatusChip from "./chip";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";

export type CoinDataProps = {
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

export type TableProps = {
  data: CoinDataProps[];
};

const DarkTableContainer = styled(TableContainer)(() => ({
  backgroundColor: "#1c1c1c",
  borderRadius: 12,
}));

const CustomTableCell = styled(TableCell)(() => ({
  color: "#8c8c8c",
  borderBottom: "1px solid #333",
  fontSize: 18,
  // borderLeft: "1px solid #333",
  // borderRight: "1px solid #333",
}));

export const CoinTable: React.FC<TableProps> = ({ data }) => {
  const [page, setPage] = useState<number>(0);
  const rowCount = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(page * rowCount, page * rowCount + rowCount);

  return (
    <DarkTableContainer sx={{ padding: 2, minWidth: 700 }}>
      <p className="p-4 font-bold text-2xl text-white">Payment History</p>
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
        count={data.length}
        rowsPerPage={rowCount}
        page={page}
        onPageChange={handleChangePage}
      />
    </DarkTableContainer>
  );
};

export default CoinTable;
