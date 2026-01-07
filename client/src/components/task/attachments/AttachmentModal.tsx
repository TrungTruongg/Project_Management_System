import { useState } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import { IoMdClose as CloseIcon } from "react-icons/io";
import { AttachFile, Link as LinkIcon, CloudUpload } from "@mui/icons-material";
import api from "../../api/axiosConfig";

interface AttachmentModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onAttachmentAdded: () => void;
}

function AttachmentModal({
  open,
  onClose,
  taskId,
  onAttachmentAdded,
}: AttachmentModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [url, setUrl] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/attachments/link", {
        taskId,
        url: url.trim(),
        displayText: displayText.trim() || null,
      });

      onAttachmentAdded();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to attach link");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("taskId", taskId);

      await api.post("/attachments/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onAttachmentAdded();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTabValue(0);
    setUrl("");
    setDisplayText("");
    setSelectedFile(null);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Attach
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<LinkIcon />} label="Link" />
          <Tab icon={<CloudUpload />} label="Computer" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Link Tab */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleLinkSubmit}>
            <TextField
              fullWidth
              label="Search or paste link"
              placeholder="Find recent links or paste a new link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Display text (optional)"
              placeholder="Text to display"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              helperText="Give this link a title or description"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
              >
                {loading ? "Attaching..." : "Attach"}
              </Button>
            </Box>
          </Box>
        )}

        {/* Upload Tab */}
        {tabValue === 1 && (
          <Box>
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                mb: 3,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                hidden
                onChange={handleFileChange}
              />
              <AttachFile sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {selectedFile
                  ? selectedFile.name
                  : "Choose a file or drag and drop here"}
              </Typography>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                disabled={!selectedFile || loading}
                onClick={handleFileUpload}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default AttachmentModal;