import { Box, IconButton } from "@mui/material"
import { MdDownload as DownloadIcon } from "react-icons/md";
import { FaRegTrashAlt as DeleteIcon } from "react-icons/fa";

function PreviewActionButtons({ attachment, onDelete }: any) {
    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            // Nếu là link external, mở trong tab mới
            if (attachment.type === 'link') {
                window.open(attachment.url, '_blank', 'noopener,noreferrer');
                return;
            }

            // Nếu là file upload, download
            const response = await fetch(attachment.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.name || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            window.open(attachment.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Box
            className="preview-actions"
            sx={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 0.5,
                opacity: 0,
                transition: "0.2s",
                pointerEvents: "none",
            }}
        >
            <IconButton
                onClick={handleDownload}
                size="small"
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#dddee1",
                    borderRadius: "50%",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#b7b9be" },
                }}
                title="Download"
            >
                <DownloadIcon />
            </IconButton>

            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(attachment);
                }}
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#dddee1",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "#ffcdd2" }
                }}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}

export default PreviewActionButtons
