import { useEffect, useRef, useState } from 'react';
import { MdAttachFile } from 'react-icons/md';
import HighPriority from '../../assets/HighPriority';
import MediumPriority from '../../assets/MediumPriority';
import LowPriority from '../../assets/LowPriority';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextareaAutosize,
  TextField,
  Typography,
} from '@mui/material';
import { createNotification } from '../utils/createNotification';
import { useUser } from '../context/UserContext';
import api from '../api/axiosConfig';
import AttachmentList from './attachments/AttachmentList';
import AttachmentPreviewModal from './attachments/AttachmentPreviewModal';

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

function CreateTaskModal({ open, onClose, onSave, onUpdate, selectedTask = null }: any) {
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [previewAtt, setPreviewAtt] = useState<AttachmentItem | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [status, setStatus] = useState('to-do');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdate = selectedTask !== null;

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [responseTask, responseUser, responseAttachment] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
        api.get('/attachments'),
      ]);

      setTasks(responseTask.data);
      setUsers(responseUser.data);

      if (selectedTask) {
        const taskAttachments: AttachmentItem[] = responseAttachment.data
          .filter((att: any) => att.taskId === selectedTask._id)
          .map((att: any) => ({
            _id: att._id,
            name: att.name,
            url: att.url,
            type: att.type,
            isExisting: true,
            uploadedAt: att.uploadedAt,
          }));
        setAttachments(taskAttachments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    const url = attachmentInput.trim();
    if (!url) return;

    if (url.startsWith('data:')) {
      setSnackbar({
        open: true,
        message: 'Invalid url',
        type: 'error',
      });
      return;
    }

    try {
      new URL(url);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Invalid url',
        type: 'error',
      });
      return;
    }

    setAttachments([
      ...attachments,
      {
        name: url,
        url: url,
        type: 'link',
        isExisting: false,
      },
    ]);
    setAttachmentInput('');
    setSnackbar({
      open: true,
      message: 'Add link successfully!',
      type: 'success',
    });
  };

  // Add file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachmentItem[] = Array.from(files).map((file) => ({
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      previewUrl: URL.createObjectURL(file),
      type: 'file',
      isExisting: false,
    }));

    setAttachments((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete attachment
  const handleRemoveAttachment = (index: number) => {
    const attachment = attachments[index];

    if (attachment.isExisting && attachment._id) {
      setDeletedAttachmentIds([...deletedAttachmentIds, attachment._id]);
    }

    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getTaskMembers = () => {
    if (!user) return [];
    return users.filter((u: any) => u._id !== user._id);
  };

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      setSnackbar({
        open: true,
        message: 'End Date must be after Start Date',
        type: 'error',
      });
      return;
    }
    if (end < now) {
      setSnackbar({
        open: true,
        message: 'End Date cannot be in the past',
        type: 'error',
      });
      return;
    }

    return true;
  };

  const uploadFile = async (file: File, taskId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    const response = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  };

  const validateForm = () => {
    if (!name.trim() || !priority || !status || !startDate || !endDate) {
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dateError = validateDates();
    if (!dateError) return;

    setLoading(true);

    try {
      let completion = 0;
      if (status === 'to-do') {
        completion = 0;
      } else if (status === 'in-progress') {
        completion = 50;
      } else if (status === 'done') {
        completion = 100;
      }

      const taskData = {
        name,
        description,
        startDate,
        endDate,
        assignedTo,
        priority: priority.toLowerCase(),
        status,
        completion,
        leaderId: user?._id,
      };

      let taskId: string;

      if (isUpdate) {
        const response = await api.put(`/tasks/update/${selectedTask._id}`, taskData);

        const updatedData = response.data.task || response.data;
        taskId = updatedData._id || selectedTask?._id || selectedTask._id;

        if (!updatedData._id && taskId) {
          updatedData._id = taskId;
        }

        // Delete old attachments
        for (const attachmentId of deletedAttachmentIds) {
          try {
            await api.delete(`/attachments/delete/${attachmentId}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error deleting attachment ${attachmentId}:`, error);
          }
        }

        if (assignedTo.length > 0) {
          await createNotification({
            userId: assignedTo,
            type: 'task',
            title: `Task Updated`,
            description: `updated task: ${name}`,
            createdBy: user?._id,
          });
        }

        onUpdate(updatedData);
        onClose();
        setSnackbar({
          open: true,
          message: 'Update task successfully!',
          type: 'success',
        });
      } else {
        const response = await api.post('/tasks/create', taskData);
        const createdData = response.data;

        taskId = createdData._id || createdData.task?._id;

        // Send notifications
        if (assignedTo.length > 0) {
          await createNotification({
            userId: assignedTo,
            type: 'task',
            title: `New Task Assignment`,
            description: `assigned you to task: ${name}`,
            createdBy: user?._id,
          });
        }

        onSave(createdData);
        onClose();
        setSnackbar({
          open: true,
          message: 'Create task successfully!',
          type: 'success',
        });
      }

      for (const att of attachments) {
        if (att.isExisting) continue;

        let finalUrl = att.url;

        if (att.type === 'file' && att.file) {
          try {
            finalUrl = await uploadFile(att.file, taskId);
          } catch (error) {
            console.error('Error uploading file:', error);
            continue;
          }
        }

        try {
          await api.post('/attachments/create', {
            taskId: taskId,
            url: finalUrl,
            name: att.name,
            type: att.type,
            createdBy: user?._id,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error saving attachment:', error);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllData();
      setShowError(false);

      if (selectedTask) {
        // Check if current user is project leader
        const task = tasks.find((t) => t._id === selectedTask._id);
        const isLeader = task?.leaderId === user?._id;
        const isAssigned = Array.isArray(selectedTask.assignedTo)
          ? selectedTask.assignedTo.includes(user?._id)
          : selectedTask.assignedTo === user?._id;

        // Status-only mode if not leader but assigned to task
        setIsStatusOnly(!isLeader && isAssigned);

        setName(selectedTask.name || '');
        setDescription(selectedTask.description || '');
        setStartDate(selectedTask.startDate || '');
        setEndDate(selectedTask.endDate || '');
        setPriority(selectedTask.priority || '');
        setAssignedTo(Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : []);
        setStatus(selectedTask.status || '');
      } else {
        setIsStatusOnly(false);
        setName('');
        setDescription('');
        setAttachments([]);
        setStartDate('');
        setEndDate('');
        setPriority('');
        setAssignedTo([]);
        setStatus('to-do');
      }
      setDeletedAttachmentIds([]);
    }
  }, [open, selectedTask]);

  const taskMembers = getTaskMembers();

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          component="form"
          onSubmit={handleSave}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '600px' },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: '18px',
                lineHeight: '28px',
                fontWeight: 600,
              }}
            >
              {isStatusOnly ? 'Update Task Status' : isUpdate ? 'Update Task' : 'Create Task'}
            </Typography>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 2,
              overflow: 'auto',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {!isStatusOnly && (
              <>
                {/* Name */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Name <span className="text-red-500">*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type task name"
                    error={showError && !name.trim()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                      },
                    }}
                  />
                  {showError && !name.trim() && (
                    <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 0.5 }}>
                      Task name is required
                    </Typography>
                  )}
                </Box>

                <Box className="gap-4">
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Description
                  </Typography>
                  <Box
                    sx={{
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      '&:focus-within': {
                        border: '2px solid #1976d2',
                      },
                      '& textarea': {
                        '&::placeholder': {
                          color: '#9ca3af',
                        },
                      },
                    }}
                  >
                    <TextareaAutosize
                      placeholder="Type description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      minRows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        resize: 'none',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </Box>
                </Box>

                {/* Attachments */}
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Attachments</Typography>

                    <Chip
                      label={attachments.length}
                      size="small"
                      sx={{ height: 20, fontSize: '11px' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />

                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<MdAttachFile />}
                      onClick={() => fileInputRef.current?.click()}
                      size="small"
                    >
                      File
                    </Button>

                    <TextField
                      size="small"
                      placeholder="or paste link"
                      value={attachmentInput}
                      onChange={(e) => setAttachmentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                        },
                      }}
                    />

                    <Button type="button" variant="outlined" onClick={handleAddLink} size="small">
                      Add
                    </Button>
                  </Box>

                  {attachments.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        padding: '8px 4px',
                        borderRadius: '4px',
                      }}
                    >
                      {attachments.map((att, i) => (
                        <AttachmentList
                          key={i}
                          att={att}
                          onRemove={() => handleRemoveAttachment(i)}
                          onPreview={() => setPreviewAtt(att)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Dates */}
                <Box className="flex gap-4">
                  <Box className="w-full">
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Start Date <span className="text-red-500">*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          color: startDate === '' ? '#9ca3af' : '',
                        },
                      }}
                    />
                    {showError && !startDate && (
                      <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 0.5 }}>
                        Start Date is required
                      </Typography>
                    )}
                  </Box>

                  <Box className="w-full">
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      End Date <span className="text-red-500">*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          color: endDate === '' ? '#9ca3af' : '',
                        },
                      }}
                    />
                    {showError && !endDate && (
                      <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 0.5 }}>
                        Due date is required
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Asigned To */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Assign To
                  </Typography>

                  <Select
                    fullWidth
                    size="small"
                    displayEmpty
                    multiple
                    onChange={(e) => setAssignedTo(e.target.value as [])}
                    value={assignedTo}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <span style={{ color: '#9ca3af' }}>Choose members</span>;
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((userId: any) => {
                            const member = users.find((u: any) => u._id === userId);
                            return (
                              <Chip
                                key={userId}
                                label={`${member?.firstName} ${member?.lastName}`}
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      );
                    }}
                    sx={{
                      fontSize: '14px',
                      color: 'black',
                      textTransform: 'capitalize',
                    }}
                  >
                    {users.length === 0 ? (
                      <MenuItem disabled>No user available</MenuItem>
                    ) : (
                      taskMembers.map((user: any) => (
                        <MenuItem value={user._id} key={user._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={user.avatar}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '12px',
                                bgcolor: '#E0E0E0',
                                color: '#484c7f',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                              }}
                              title={`${user.firstName} ${user.lastName}`}
                            >
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </Avatar>
                            <ListItemText
                              primary={`${user.firstName} ${user.lastName}`}
                              secondary={user.email.toLowerCase()}
                            />
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </Box>

                {/* Priority */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Priority <span className="text-red-500">*</span>
                  </Typography>
                  <Select
                    fullWidth
                    displayEmpty
                    size="small"
                    value={priority}
                    error={showError && !priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{
                      fontSize: '14px',
                      color: priority === '' ? '#9ca3af' : '',
                    }}
                  >
                    <MenuItem value="" disabled>
                      Choose priority
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HighPriority />
                        <span>High</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MediumPriority />
                        <span>Medium</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LowPriority />
                        <span>Low</span>
                      </Box>
                    </MenuItem>
                  </Select>

                  {showError && !priority && (
                    <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 0.5 }}>
                      Priority is required
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {/* Status */}
            <Box>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Status <span className="text-red-500">*</span>
              </Typography>
              <Select
                fullWidth
                displayEmpty
                size="small"
                value={status}
                error={showError && !status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{
                  fontSize: '14px',
                  color: status === '' ? '#9ca3af' : '',
                }}
              >
                <MenuItem value="" disabled>
                  Choose Status
                </MenuItem>
                <MenuItem value="to-do">To Do</MenuItem>
                <MenuItem value="in-progress">In progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
              {showError && !status && (
                <Typography sx={{ fontSize: '12px', color: '#ef4444', mt: 0.5 }}>
                  Status is required
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, pt: 2 }}>
              <Button type="button" fullWidth variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                loading={loading}
                loadingPosition="end"
                sx={{ bgcolor: '#9333ea', color: 'white' }}
              >
                {isUpdate ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Preview Modal */}
      {previewAtt && (
        <AttachmentPreviewModal attachment={previewAtt} onClose={() => setPreviewAtt(null)} />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ mt: 10 }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CreateTaskModal;
