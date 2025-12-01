import { useEffect, useState } from "react";
import { IoMdClose as CloseIcon } from "react-icons/io";

import {
    Box,
    Button,
    InputAdornment,
    MenuItem,
    Modal,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";

function UpdateMemberProfileModal({
    open,
    onClose,
    onUpdate,
    selectedUser = null,
}: any) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [location, setLocation] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && selectedUser) {
            setFirstName(selectedUser.firstName || "");
            setLastName(selectedUser.lastName || "");
            setEmail(selectedUser.email || "");
            setPhone(selectedUser.phone || "");
            setJoinDate(selectedUser.joinDate || "");
            setLocation(selectedUser.location || "");
            setLoading(false);
        }
    }, [open, selectedUser]);

    const validate = () => {
        const newErrors: any = {};

        if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }
        if (!/^[3-9][0-9]{8}$/.test(phone)) {
            newErrors.phone = "Invalid Vietnamese number";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const usersResponse = await axios.get(
                `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=69205e8dbf3939eacf2e89f2`
            );

            const existingUsers = usersResponse.data.data.data;

            const emailExists = existingUsers.some(
                (user: any) => user.email === email && user.id !== selectedUser.id
            );

            if (emailExists) {
                setErrors({ ...errors, email: "Email already exists" });
                setLoading(false);
                return;
            }

            const updatedUser = {
                id: selectedUser.id,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                joinDate: joinDate,
                location: location,
                password: selectedUser.password,
                role: selectedUser.role,
            };

            const response = await axios.put(
                `https://mindx-mockup-server.vercel.app/api/resources/users/${selectedUser._id}?apiKey=69205e8dbf3939eacf2e89f2`,
                updatedUser
            );

            onUpdate(response.data.data);
            onClose();
        }
        catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            aria-labelledby="spring-modal-title"
            aria-describedby="spring-modal-description"
            open={open}
            onClose={onClose}
            closeAfterTransition
            className="flex items-center justify-center"
        >
            <Box className="relative bg-white rounded-xl w-[500px] overflow-y-auto shadow-xl mx-auto p-6">
                <Box className="flex items-center justify-between mb-8">
                    <Typography
                        sx={{
                            fontSize: "18px",
                            lineHeight: "28px",
                            fontWeight: 600,
                        }}
                    >
                        Update Member Profile
                    </Typography>
                    <Button
                        onClick={onClose}
                        sx={{
                            minWidth: "30px",
                            width: "30px",
                            height: "30px",
                            padding: 0,
                            borderRadius: "50%",
                            color: "rgb(156, 163, 175)",
                            "&:hover": {
                                backgroundColor: "#d5d5d5",
                                color: "rgb(75, 85, 99)",
                            },
                            transition: "all 0.2s",
                        }}
                    >
                        <CloseIcon className="w-10 h-10" />
                    </Button>
                </Box>

                <Box component="form" className="space-y-4" onSubmit={handleSave}>
                    <Box className="flex gap-4">
                        <Box className="w-full">
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    mb: 0.5,
                                    color: "#374151",
                                }}
                            >
                                First Name <span className="text-red-500">*</span>
                            </Typography>
                            <TextField
                                fullWidth
                                type="text"
                                size="small"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Type first name..."
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        </Box>

                        <Box className="w-full">
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    mb: 0.5,
                                    color: "#374151",
                                }}
                            >
                                Last Name <span className="text-red-500">*</span>
                            </Typography>
                            <TextField
                                fullWidth
                                type="text"
                                size="small"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Type last name..."
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        fontSize: "14px",
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box className="gap-4">
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                mb: 0.5,
                                color: "#374151",
                            }}
                        >
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type email..."
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!errors.email}
                            helperText={
                                errors.email && (
                                    <span style={{ color: "#ffcdd2" }}>{errors.email}</span>
                                )
                            }
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "14px",
                                },
                            }}
                        />
                    </Box>

                    <Box className="gap-4">
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                mb: 0.5,
                                color: "#374151",
                            }}
                        >
                            Phone
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type phone number..."
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            error={!!errors.phone}
                            helperText={
                                errors.phone && (
                                    <span style={{ color: "#ffcdd2" }}>
                                        {errors.phone}
                                    </span>
                                )
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            +84
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "14px",
                                },
                            }}
                        />
                    </Box>

                    <Box className=" gap-4">
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                mb: 0.5,
                                color: "#374151",
                            }}
                        >
                            Join Date
                        </Typography>
                        <TextField
                            fullWidth
                            type="date"
                            size="small"
                            value={joinDate}
                            onChange={(e) => setJoinDate(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "14px",
                                },
                            }}
                        />
                    </Box>

                    <Box className=" gap-4">
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                mb: 0.5,
                                color: "#374151",
                            }}
                        >
                            Location
                        </Typography>
                        <Select
                            fullWidth
                            displayEmpty
                            size="small"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            sx={{
                                fontSize: "14px",
                                color: location === "" ? "#9ca3af" : "#111827",
                                bgcolor: "white",
                                borderRadius: "8px"
                            }}
                        >
                            <MenuItem value="" >
                                Choose Location
                            </MenuItem>
                            <MenuItem value="Ha Noi">Ha Noi</MenuItem>
                            <MenuItem value="Ho Chi Minh City">Ho Chi Minh City</MenuItem>
                            <MenuItem value="Da Nang">Da Nang</MenuItem>
                            <MenuItem value="Hai Phong">Hai Phong</MenuItem>
                            <MenuItem value="Can Tho">Can Tho</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                textTransform: "none",
                                color: "#374151",
                                borderColor: "#d1d5db",
                                fontSize: "14px",
                                fontWeight: 500,
                                py: 1,
                                "&:hover": {
                                    borderColor: "#9ca3af",
                                    backgroundColor: "#f9fafb",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            loading={loading}
                            loadingPosition="end"
                            sx={{
                                textTransform: "none",
                                backgroundColor: "#9333ea",
                                fontSize: "14px",
                                fontWeight: 500,
                                py: 1,
                                "&:hover": {
                                    backgroundColor: "#7e22ce",
                                },
                            }}
                        >
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

export default UpdateMemberProfileModal;
