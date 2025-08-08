import React, { ChangeEvent, useEffect, useState } from "react";
import { UserDataProps } from "./usertable";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, styled } from "@mui/material";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { convertToJSON, flatten2D } from "~~/utils/helper";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserDataProps) => void;
  groupSubmit: (data: UserDataProps[]) => void;
  initialData?: UserDataProps | null;
};

const UserFormModal: React.FC<Props> = ({ open, onClose, onSubmit, groupSubmit, initialData }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (initialData) {
      setWalletAddress(initialData.walletAddress);
      setStatus(initialData.status);
    } else {
      setWalletAddress("");
      setStatus("active");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!walletAddress) return;
    onSubmit({ walletAddress, status });
    onClose();
  };

  const handleSubmitExcel = async (data: ChangeEvent<HTMLInputElement>) => {
    const file = data.target.files?.[0];
    if (!file) return;
    // 2d array
    const excelJSON = await convertToJSON(file);

    groupSubmit(flatten2D(excelJSON));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: "#1e1e1e", color: "#fff", padding: 2, borderRadius: 2, minWidth: 405 } }}
    >
      <DialogTitle sx={{ color: "#fff" }}>{initialData ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Wallet Address"
          fullWidth
          margin="normal"
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          InputProps={{ sx: { color: "#fff", borderColor: "#fff" } }}
          InputLabelProps={{ sx: { color: "#aaa" } }}
          sx={{
            fieldset: {
              borderColor: "#fff",
            },
            "&:hover fieldset": {
              borderColor: "#fff !important",
            },
          }}
        />
        <TextField
          select
          label="Status"
          fullWidth
          margin="normal"
          value={status}
          onChange={e => setStatus(e.target.value as "active" | "inactive")}
          InputProps={{ sx: { color: "#fff" } }}
          InputLabelProps={{ sx: { color: "#aaa" } }}
          sx={{
            fieldset: {
              borderColor: "#fff",
            },
            "&:hover fieldset": {
              borderColor: "#fff !important",
            },
          }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<CloudArrowUpIcon width={20} height={20} />}
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
        >
          Excel
          <VisuallyHiddenInput
            type="file"
            // onChange={(event: { target: { files: any } }) => console.log(event.target.files)}
            multiple
            onChange={handleSubmitExcel}
          />
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
