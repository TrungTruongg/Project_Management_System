import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControlLabel,
    Paper,
    Popper,
    TextField,
    Typography,
    Divider,
    ClickAwayListener,
    Avatar,
} from '@mui/material';
import {
    KeyboardArrowDown,
    Close as CloseIcon,
    Person as PersonIcon,
    CheckCircle as StatusIcon,
    Flag as PriorityIcon,
} from '@mui/icons-material';
import HighPriority from '../../assets/HighPriority';
import MediumPriority from '../../assets/MediumPriority';
import LowPriority from '../../assets/LowPriority';

interface TaskFiltersProps {
    users: any[];
    currentUser: any;
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

export interface FilterState {
    assignee: string[];
    status: string[];
    priority: string[];
}

function TaskFilters({ users, currentUser, onFilterChange, initialFilters }: TaskFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {
        assignee: [],
        status: [],
        priority: [],
    });

    const [anchorEl, setAnchorEl] = useState<{
        assignee: null | HTMLElement;
        status: null | HTMLElement;
        priority: null | HTMLElement;
    }>({
        assignee: null,
        status: null,
        priority: null,
    });

    const [searchTerms, setSearchTerms] = useState({
        assignee: '',
        status: '',
        priority: '',
    });

    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters]);

    const statusOptions = [
        { value: 'to-do', label: 'TO DO', color: '#616161' },
        { value: 'in-progress', label: 'IN PROGRESS', color: '#1976d2' },
        { value: 'completed', label: 'COMPLETED', color: '#2e7d32' },
    ];

    const priorityOptions = [
        { value: 'high', label: 'High', IconComponent: HighPriority },
        { value: 'medium', label: 'Medium', IconComponent: MediumPriority },
        { value: 'low', label: 'Low', IconComponent: LowPriority },
    ];

    const handleTogglePopper = (type: 'assignee' | 'status' | 'priority', event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(prev => ({
            ...prev,
            [type]: prev[type] ? null : event.currentTarget,
        }));
    };

    const handleClosePopper = (type: 'assignee' | 'status' | 'priority') => {
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
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerms.assignee.toLowerCase())
    );

    // Filter statuses based on search
    const filteredStatuses = statusOptions.filter(status =>
        status.label.toLowerCase().includes(searchTerms.status.toLowerCase())
    );

    // Filter priorities based on search
    const filteredPriorities = priorityOptions.filter(priority =>
        priority.label.toLowerCase().includes(searchTerms.priority.toLowerCase())
    );

    const renderFilterButton = (
        type: 'assignee' | 'status' | 'priority',
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
                            <Box
                                component="span"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearFilter(type);
                                }}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    ml: 0.5,
                                    p: 0.25,
                                    borderRadius: '50%',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </Box>
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
            {/* Assignee Filter */}
            {renderFilterButton('assignee', 'Assignee', <PersonIcon sx={{ fontSize: 16 }} />)}
            <Popper
                open={Boolean(anchorEl.assignee)}
                anchorEl={anchorEl.assignee}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('assignee')}>
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
                                Assignees
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search Assignee"
                                value={searchTerms.assignee}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, assignee: e.target.value }))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ overflowY: 'auto', flex: 1 }}>
                            {/* Current User */}
                            <Box sx={{ p: 1.5 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={filters.assignee.includes(currentUser?._id)}
                                            onChange={() => handleToggleFilter('assignee', currentUser?._id)}
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                src={currentUser?.avatar}
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    fontSize: "10px",
                                                    bgcolor: "#E0E0E0",
                                                    textTransform: "uppercase"
                                                }}
                                                title={`${currentUser?.firstName} ${currentUser?.lastName}`}
                                            >
                                                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '14px' }}>Current User</Typography>
                                        </Box>
                                    }
                                />
                            </Box>

                            <Divider />

                            {/* Suggested Users */}
                            <Box sx={{ p: 1.5 }}>
                                <Typography sx={{ fontSize: '12px', color: '#5e6c84', mb: 1 }}>
                                    Suggested Users
                                </Typography>
                                {filteredUsers.map(user => (
                                    <FormControlLabel
                                        key={user._id}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.assignee.includes(user._id)}
                                                onChange={() => handleToggleFilter('assignee', user._id)}
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
                                    color: filters.assignee.length > 0 ? '#5e6c84' : '#9e9e9e',
                                }}
                            >
                                {filteredUsers.length} of {users.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            {/* Status Filter */}
            {renderFilterButton('status', 'Status', <StatusIcon sx={{ fontSize: 16 }} />)}
            <Popper
                open={Boolean(anchorEl.status)}
                anchorEl={anchorEl.status}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('status')}>
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
                                Status
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search Status"
                                value={searchTerms.status}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, status: e.target.value }))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ p: 1.5 }}>
                            {filteredStatuses.map(status => (
                                <FormControlLabel
                                    key={status.value}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={filters.status.includes(status.value)}
                                            onChange={() => handleToggleFilter('status', status.value)}
                                        />
                                    }
                                    label={
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            sx={{
                                                bgcolor: `${status.color}15`,
                                                color: status.color,
                                                fontWeight: 600,
                                                fontSize: '11px',
                                            }}
                                        />
                                    }
                                    sx={{ width: '100%', m: 0, mb: 0.5 }}
                                />
                            ))}
                        </Box>

                        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84' }}>
                                {filteredStatuses.length} of {statusOptions.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>

            {/* Priority Filter */}
            {renderFilterButton('priority', 'Priority', <PriorityIcon sx={{ fontSize: 16 }} />)}
            <Popper
                open={Boolean(anchorEl.priority)}
                anchorEl={anchorEl.priority}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={() => handleClosePopper('priority')}>
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
                                Priority
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search Priority"
                                value={searchTerms.priority}
                                onChange={(e) => setSearchTerms(prev => ({ ...prev, priority: e.target.value }))}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ p: 1.5 }}>
                            {filteredPriorities.map(priority => {
                                const IconComponent = priority?.IconComponent;
                                return (
                                    <FormControlLabel
                                        key={priority.value}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={filters.priority.includes(priority.value)}
                                                onChange={() => handleToggleFilter('priority', priority.value)}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconComponent />
                                                <Typography sx={{ fontSize: '14px' }}>{priority.label}</Typography>
                                            </Box>
                                        }
                                        sx={{ width: '100%', m: 0, mb: 0.5 }}
                                    />
                                )
                            }

                            )}
                        </Box>

                        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '12px', color: '#5e6c84' }}>
                                {filteredPriorities.length} of {priorityOptions.length}
                            </Typography>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
}

export default TaskFilters;