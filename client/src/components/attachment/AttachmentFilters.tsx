import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControlLabel,
    IconButton,
    Paper,
    Popper,
    TextField,
    Typography,
    ClickAwayListener,
    Avatar,
} from '@mui/material';
import {
    KeyboardArrowDown,
    Close as CloseIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import {PiMicrosoftExcelLogoBold as SpreadsheetTypeIcon} from "react-icons/pi";
import {
    FiImage as ImageTypeIcon,
    FiFileText as DocumentTypeIcon,
    FiFile as PDFTypeIcon,
    FiVideo as VideoTypeIcon
} from "react-icons/fi";
import { GoFile as TypeIcon } from "react-icons/go";
import { MdDateRange as DateIcon } from "react-icons/md";

interface AttachmentFiltersProps {
    users: any[];
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    createdBy: string[];
    type: string[];
    createdDate: string[];
}

function AttachmentFilters({ users, onFilterChange }: AttachmentFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        createdBy: [],
        type: [],
        createdDate: [],
    });

    const [anchorEl, setAnchorEl] = useState<{
        createdBy: null | HTMLElement;
        type: null | HTMLElement;
        createdDate: null | HTMLElement;
    }>({
        createdBy: null,
        type: null,
        createdDate: null,
    });

    const [searchTerms, setSearchTerms] = useState({
        createdBy: '',
        type: '',
        createdDate: '',
    });

    const typeOptions = [
        { value: 'image', label: 'Images', IconComponent: ImageTypeIcon, color: "#CD519D" },
        { value: 'document', label: 'Documents', IconComponent: DocumentTypeIcon, color: "#357DE8" },
        { value: 'pdf', label: 'PDFs', IconComponent: PDFTypeIcon, color: "#C9372C" },
        { value: 'spreadsheet', label: 'Spreadsheets', IconComponent: SpreadsheetTypeIcon, color: "#22A06B" },
        { value: 'video', label: 'Audio', IconComponent: VideoTypeIcon, color: "#2898BD" },
    ];

    const createdDateOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last-7-days', label: 'Last 7 days' },
        { value: 'this-month', label: 'This month' },
        { value: 'this-year', label: `This year (${new Date().getFullYear()})` },
    ];

    const handleTogglePopper = (type: 'createdBy' | 'type' | 'createdDate', event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(prev => ({
            ...prev,
            [type]: prev[type] ? null : event.currentTarget,
        }));
    };

    const handleClosePopper = (type: 'createdBy' | 'type' | 'createdDate') => {
        setAnchorEl(prev => ({ ...prev, [type]: null }));
    };

    const handleToggleFilter = (type: keyof FilterState, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            const index = newFilters[type].indexOf(value);

            if (index > -1) {
                newFilters[type] = newFilters[type].filter(v => v !== value);
            } else {
                newFilters[type] = [...newFilters[type], value];
            }

            return newFilters;
        });
    };

    const handleClearFilter = (type: keyof FilterState) => {
        setFilters(prev => ({ ...prev, [type]: [] }));
    };

    const getActiveFilterCount = (type: keyof FilterState) => {
        return filters[type].length;
    };

    useEffect(() => {
        onFilterChange(filters);
    }, [filters]);

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerms.createdBy.toLowerCase())
    );

    // Filter types based on search
    const filteredTypes = typeOptions.filter(type =>
        type.label.toLowerCase().includes(searchTerms.type.toLowerCase())
    );

    // Filter dates based on search
    const filteredCreatedDate = createdDateOptions.filter(date =>
        date.label.toLowerCase().includes(searchTerms.createdDate.toLowerCase())
    );

    const renderFilterButton = (
        type: 'createdBy' | 'type' | 'createdDate',
        label: string,
        icon: React.ReactNode
    ) => {
        const count = getActiveFilterCount(type);

        return (
            <Box sx={{ position: 'relative' }}>
                <Button
                    variant={count > 0 ? 'contained' : 'outlined'}
                    size="small"
                    endIcon={
                        count > 0 ? (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearFilter(type);
                                }}
                                sx={{
                                    p: 0,
                                    ml: 0.5,
                                    color: 'inherit',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        ) : (
                            <KeyboardArrowDown />
                        )
                    }
                    onClick={(e) => handleTogglePopper(type, e)}
                    sx={{
                        textTransform: 'none',
                        bgcolor: count > 0 ? '#1976d2' : 'transparent',
                        color: count > 0 ? 'white' : '#5e6c84',
                        borderColor: '#dfe1e6',
                        '&:hover': {
                            bgcolor: count > 0 ? '#1565c0' : '#f4f5f7',
                            borderColor: '#dfe1e6',
                        },
                        px: 1.5,
                        py: 0.5,
                        minHeight: '32px',
                    }}
                >
                    {icon}
                    <Box component="span" sx={{ ml: 0.5 }}>
                        {label}
                        {count > 0 && (
                            <Chip
                                label={count}
                                size="small"
                                sx={{
                                    ml: 1,
                                    height: 18,
                                    fontSize: '11px',
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                }}
                            />
                        )}
                    </Box>
                </Button>
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Created By Filter */}
            {renderFilterButton('createdBy', 'Created By', <PersonIcon sx={{ fontSize: 16 }} />)}
            <Popper
                open={Boolean(anchorEl.createdBy)}
                anchorEl={anchorEl.createdBy}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('createdBy')}>
                    <Paper
                        elevation={3}
                        sx={{
                            width: 320,
                            maxHeight: 400,
                            mt: 1,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84', mb: 1 }}>
                                Created By
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search Assignee"
                                value={searchTerms.createdBy}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, assignee: e.target.value }))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ overflowY: 'auto', flex: 1 }}>
                            {/* Suggested Users */}
                            <Box sx={{ p: 1.5 }}>
                                {filteredUsers.map(user => (
                                    <FormControlLabel
                                        key={user._id}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.createdBy.includes(user._id)}
                                                onChange={() => handleToggleFilter('createdBy', user._id)}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar
                                                    src={user.avatar}
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        fontSize: "10px",
                                                        bgcolor: "#E0E0E0",
                                                        textTransform: "uppercase"
                                                    }}
                                                    title={`Members: ${user.firstName} ${user.lastName}`}
                                                >
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </Avatar>
                                                <Typography sx={{ fontSize: '14px', textTransform: "capitalize" }}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ width: '100%', m: 0, mb: 0.5 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography
                                sx={{
                                    fontSize: '12px',
                                    color: filters.createdBy.length > 0 ? '#5e6c84' : '#9e9e9e',
                                }}
                            >
                                {filteredUsers.length} of {users.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            {/* Type Filter */}
            {renderFilterButton('type', 'Type', <TypeIcon fontSize="16" />)}
            <Popper
                open={Boolean(anchorEl.type)}
                anchorEl={anchorEl.type}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('type')}>
                    <Paper
                        elevation={3}
                        sx={{
                            width: 300,
                            mt: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84', mb: 1 }}>
                                Type
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search Type"
                                value={searchTerms.type}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, type: e.target.value }))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ p: 1.5 }}>
                            {filteredTypes.map(type => {
                                const IconComponent = type?.IconComponent;
                                return (
                                    <FormControlLabel
                                        key={type.value}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.type.includes(type.value)}
                                                onChange={() => handleToggleFilter('type', type.value)}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconComponent color={type.color} />
                                                <Typography sx={{ fontSize: '14px' }}>{type.label}</Typography>
                                            </Box>
                                        }
                                        sx={{ width: '100%', m: 0, mb: 0.5 }}
                                    />
                                )
                            })}
                        </Box>

                        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84' }}>
                                {filteredTypes.length} of {typeOptions.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            {/* Dates Filter */}
            {renderFilterButton('createdDate', 'Created Date', <DateIcon fontSize="16" />)}
            <Popper
                open={Boolean(anchorEl.createdDate)}
                anchorEl={anchorEl.createdDate}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('createdDate')}>
                    <Paper
                        elevation={3}
                        sx={{
                            width: 300,
                            mt: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ p: 1.5 }}>
                            {filteredCreatedDate.map(date => {

                                return (
                                    <FormControlLabel
                                        key={date.value}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.createdDate.includes(date.value)}
                                                onChange={() => handleToggleFilter('createdDate', date.value)}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ fontSize: '14px' }}>{date.label}</Typography>
                                        }
                                        sx={{ width: '100%', m: 0, mb: 0.5 }}
                                    />
                                )
                            })}
                        </Box>

                        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84' }}>
                                {filteredCreatedDate.length} of {createdDateOptions.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
}

export default AttachmentFilters;