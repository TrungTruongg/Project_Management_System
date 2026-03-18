import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { MdClose, MdInsertDriveFile } from 'react-icons/md';

interface AttachmentItem {
  _id?: string;
  name: string;
  url: string;
  type: 'file' | 'link' | 'image' | 'video';
  file?: File;
  isExisting: boolean;
  uploadedAt?: string;
  previewUrl?: string;
}

function AttachmentPreviewModal({
  attachment,
  onClose,
}: {
  attachment: AttachmentItem | null;
  onClose: () => void;
}) {
  if (!attachment) return null;

  const url = attachment.previewUrl || attachment.url;
  const ext = attachment.name?.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext);
  const isDoc = ['txt', 'pdf'].includes(ext);

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          maxHeight: '85vh',
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '85%',
            }}
          >
            {attachment.name}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <MdClose />
          </IconButton>
        </Box>

        {/* Body */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f9fafb',
            p: 2,
            minHeight: '300px',
          }}
        >
          {isImage ? (
            <img
              src={url}
              alt={attachment.name}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 4 }}
            />
          ) : isVideo ? (
            <video
              src={url}
              controls
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 4 }}
            />
          ) : isDoc ? (
            <iframe
              src={url}
              style={{ width: '100%', height: '65vh', border: 'none', borderRadius: 4 }}
              title={attachment.name}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <MdInsertDriveFile style={{ fontSize: 64, color: '#9ca3af' }} />
              <Typography sx={{ mt: 1, fontSize: '14px', color: '#6b7280' }}>
                Preview not available for this file type
              </Typography>
              {attachment.isExisting && (
                <Button
                  variant="contained"
                  size="small"
                  href={attachment.url}
                  download
                  sx={{ textTransform: 'capitalize', fontWeight: 600, mt: 2 }}
                >
                  Download
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default AttachmentPreviewModal;
