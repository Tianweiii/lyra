import React, { useEffect, useState } from "react";
import { UserDataProps } from "./usertable";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserDataProps) => void;
  initialData?: UserDataProps | null;
};

const UserFormModal: React.FC<Props> = ({ open, onClose, onSubmit, initialData }) => {
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
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
