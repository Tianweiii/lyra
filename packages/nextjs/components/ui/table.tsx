import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import CustomStatusChip from "./chip";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMediaQuery } from "react-responsive";

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

interface CustomCellProps {
  isMobile: boolean;
}

const DarkTableContainer = styled(TableContainer)(() => ({
  backgroundColor: "#1c1c1c",
  borderRadius: 12,
}));

const CustomTableCell = styled(TableCell, {
  shouldForwardProp: prop => prop !== "isMobile",
})<CustomCellProps>(props => ({
  color: "#8c8c8c",
  borderBottom: "1px solid #333",
  fontSize: props.isMobile ? 12 : 18,
}));

export const CoinTable: React.FC<TableProps> = ({ data }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [page, setPage] = useState<number>(0);
  const rowCount = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const paginatedData = data.slice(page * rowCount, page * rowCount + rowCount);

  return (
    <DarkTableContainer sx={{ padding: 2, zIndex: 10 }}>
      <p className="p-4 font-normal md:text-2xl text-lg text-white">Payment History</p>
      <Table>
        <TableHead>
          <TableRow>
            <CustomTableCell isMobile={isMobile}>ID & Date</CustomTableCell>
            <CustomTableCell isMobile={isMobile}>Coin</CustomTableCell>
            <CustomTableCell isMobile={isMobile} align="center">
              Merchant
            </CustomTableCell>
            <CustomTableCell isMobile={isMobile} align="center">
              Amount
            </CustomTableCell>
            <CustomTableCell isMobile={isMobile} align="center">
              Status
            </CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map(({ data }) => (
            <TableRow key={data.id}>
              <CustomTableCell isMobile={isMobile}>
                <div className="flex flex-col gap-1">
                  <p>REF #{data.id}</p>
                  <p>{data.date.toLocaleDateString()}</p>
                </div>
              </CustomTableCell>
              <CustomTableCell isMobile={isMobile}>
                <div className="flex gap-3 items-center">
                  <Image alt={data.coin.icon.alt} src={"/icons/usdc.svg"} width={30} height={30} />
                  <p className="font-bold">{data.coin.name}</p>
                </div>
              </CustomTableCell>
              <CustomTableCell isMobile={isMobile} align="center">
                {data.merchant}
              </CustomTableCell>
              <CustomTableCell isMobile={isMobile} align="center">
                <p
                  className={data.type === "receive" ? "text-green-500" : "text-[#FF4D49]"}
                >{`${data.type === "receive" ? "+" : "-"} $${data.amount.toFixed(2)}`}</p>
              </CustomTableCell>
              <CustomTableCell isMobile={isMobile} align="center">
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
        sx={{
          fontSize: isMobile ? 10 : 14,
          color: "white",
          "& .Mui-disabled": {
            color: "#8c8c8c",
          },
        }}
      />
    </DarkTableContainer>
  );
};

export default CoinTable;
