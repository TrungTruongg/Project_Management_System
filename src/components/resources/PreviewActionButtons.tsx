import { Box, IconButton } from "@mui/material"
import { RiEyeFill as ViewIcon } from "react-icons/ri";
import { FaRegTrashAlt as DeleteIcon } from "react-icons/fa";

function PreviewActionButtons({ attachment, onDelete }: any) {
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
                component="a"
                href={attachment.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#dddee1",
                    borderRadius: "50%",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#b7b9be" },
                }}
            >
                <ViewIcon />
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
