import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

function DeleteConfirmDialog({open, onClose, onDelete, selected, loading}: any) {
  return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm delete </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "
            <strong>{selected}</strong>"? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: "#374151",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            disabled={loading}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#EF5350",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default DeleteConfirmDialog
