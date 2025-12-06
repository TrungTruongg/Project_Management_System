import { Box, Button, Typography } from "@mui/material"
import { GoPlusCircle as AddTaskIcon } from "react-icons/go";
import { CalendarToday, Delete, Edit } from "@mui/icons-material";
import { useState } from "react";

function TicketsView() {
    const [open, setOpen] = useState(false);

    const handleOpenModal = () => {
        setOpen(true);
    }
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
            }}
        >
            <Typography variant="h4" fontWeight="700">
                Support Tickets
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddTaskIcon />}
                    onClick={handleOpenModal}
                    sx={{
                        backgroundColor: "#484c7f",
                        color: "white",
                        textTransform: "none",
                        px: 3,
                    }}
                >
                    Add Ticket
                </Button>
            </Box>
        </Box>
    )
}

export default TicketsView
