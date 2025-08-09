import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDeleteModal: React.FC<Props> = ({ open, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { backgroundColor: "#1e1e1e", color: "#fff", padding: 2, borderRadius: 2 } }}
  >
    <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteModal;
