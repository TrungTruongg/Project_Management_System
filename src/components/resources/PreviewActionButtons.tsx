import { Box, IconButton } from "@mui/material"
import { RiDownload2Fill as DownloadIcon } from "react-icons/ri";
import { FaRegTrashAlt as DeleteIcon } from "react-icons/fa";

function PreviewActionButtons({ attachment, onDelete}: any) {
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
                size="small"
                href={attachment.url}
                download={attachment.name}
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#dddee1",
                    borderRadius: "50%",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#b7b9be" },
                }}
            >
                <DownloadIcon />
            </IconButton>

            <IconButton
                size="small"
                onClick={() => onDelete(attachment)}
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#dddee1",
                    borderRadius: "50%",
                }}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}

export default PreviewActionButtons
