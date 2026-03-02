import { Box, IconButton, Typography } from '@mui/material';
import {
  BsFiletypeDoc,
  BsFiletypeDocx,
  BsFiletypePpt,
  BsFiletypePptx,
  BsFiletypeXls,
  BsFiletypeXlsx,
} from 'react-icons/bs';
import { MdDelete, MdInsertDriveFile, MdLink } from 'react-icons/md';

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

function AttachmentList({
  att,
  onRemove,
  onPreview,
}: {
  att: AttachmentItem;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const ext = att.name?.split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext);
  const isDoc = ['txt', 'pdf'].includes(ext);
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

  const thumbUrl = att.previewUrl || (att.isExisting ? att.url : '');

  const formatUploadDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'xlsx':
        return <BsFiletypeXlsx />;
      case 'xls':
        return <BsFiletypeXls />;
      case 'docx':
        return <BsFiletypeDocx />;
      case 'doc':
        return <BsFiletypeDoc />;
      case 'pptx':
        return <BsFiletypePptx />;
      case 'ppt':
        return <BsFiletypePpt />;
      default:
        return '📎';
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: '140px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderColor: '#9333ea',
        },
      }}
      onClick={onPreview}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: '90px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: att.type === 'link' || att.url ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
      >
        {isImage && thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : isVideo ? (
          <video
            src={thumbUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : isDoc ? (
          <iframe
            src={thumbUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
            }}
            title={att.name}
          />
        ) : isOffice ? (
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          >
            <Typography variant="h3" sx={{ fontSize: 48 }}>
              {getFileIcon(ext || '')}
            </Typography>
          </Box>
        ) : att.type === 'link' ? (
          <MdLink style={{ fontSize: 22, color: '#9333ea' }} />
        ) : (
          <MdInsertDriveFile style={{ fontSize: 22, color: '#6b7280' }} />
        )}
      </Box>

      {/* Name */}
      <Box sx={{ padding: '8px' }}>
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#111827',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '16px',
          }}
          title={att.name}
        >
          {att.name}
        </Typography>

        {/* Upload date/time */}
        {att.uploadedAt && (
          <Typography
            sx={{
              fontSize: '10px',
              color: '#6b7280',
              lineHeight: '14px',
            }}
          >
            {att.uploadedAt ? formatUploadDate(att.uploadedAt) : 'Uploaded'}
          </Typography>
        )}
      </Box>

      {/* Delete */}
      <IconButton
        size="small"
        onClick={(e: any) => {
          e.stopPropagation();
          onRemove();
        }}
        sx={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          padding: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: '#fee2e2',
          },
        }}
      >
        <MdDelete style={{ fontSize: '16px', color: '#ef4444' }} />
      </IconButton>
    </Box>
  );
}

export default AttachmentList;
