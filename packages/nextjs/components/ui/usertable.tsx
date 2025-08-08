import React, { useState } from "react";
import CustomStatusChip from "./chip";
import ConfirmDeleteModal from "./confirmation-modal";
import UserFormModal from "./user-modal-form";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMediaQuery } from "react-responsive";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export type UserDataProps = {
  walletAddress: string;
  status: "active" | "inactive";
};

export type TableProps = {
  data: UserDataProps[];
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

export const UserTable: React.FC<TableProps> = ({ data: initialData }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [data, setData] = useState<UserDataProps[]>(initialData);
  const [page, setPage] = useState<number>(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDataProps | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const rowCount = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditClick = (user: UserDataProps) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleFormSubmit = (newUser: UserDataProps) => {
    const updatedData = [...data];
    const existingIndex = data.findIndex(u => u.walletAddress === newUser.walletAddress);
    if (existingIndex >= 0) {
      updatedData[existingIndex] = newUser;
    } else {
      updatedData.push(newUser);
    }
    setData(updatedData);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const updatedData = [...data];
      updatedData.splice(deleteIndex, 1);
      setData(updatedData);
      setDeleteIndex(null);
    }
  };

  const paginatedData = data.slice(page * rowCount, page * rowCount + rowCount);

  return (
    <>
      <DarkTableContainer sx={{ padding: 2, zIndex: 10 }}>
        <div className="p-4 flex justify-between items-center">
          <p className="font-normal md:text-2xl text-lg text-white">Users</p>
          <button className="border-1 rounded-md px-3 py-2 hover:cursor-pointer" onClick={handleAddClick}>
            Add user
          </button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <CustomTableCell isMobile={isMobile}>ID & Date</CustomTableCell>
              <CustomTableCell isMobile={isMobile}>Wallet ID</CustomTableCell>
              <CustomTableCell isMobile={isMobile} align="center">
                Status
              </CustomTableCell>
              <CustomTableCell isMobile={isMobile} align="center">
                Action
              </CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((dataRow, i) => (
              <TableRow key={i}>
                <CustomTableCell isMobile={isMobile}>
                  <p>#{i + 1 + page * rowCount}</p>
                </CustomTableCell>
                <CustomTableCell isMobile={isMobile}>{dataRow.walletAddress}</CustomTableCell>
                <CustomTableCell isMobile={isMobile} align="center">
                  <Box display="flex" justifyContent="center">
                    <CustomStatusChip status={dataRow.status} />
                  </Box>
                </CustomTableCell>
                <CustomTableCell isMobile={isMobile} align="center">
                  <div className="flex gap-3 justify-center">
                    <PencilIcon
                      width={20}
                      height={20}
                      className="hover:cursor-pointer"
                      onClick={() => handleEditClick(dataRow)}
                    />
                    <TrashIcon
                      width={20}
                      height={20}
                      className="hover:cursor-pointer"
                      onClick={() => handleDeleteClick(i + page * rowCount)}
                    />
                  </div>
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

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
      />
      <ConfirmDeleteModal
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default UserTable;
