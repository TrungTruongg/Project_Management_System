import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AttachFile as AttachmentIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import CommentSection from '../comment/CommentSection';
import api from '../api/axiosConfig';
import MediumPriority from '../../assets/MediumPriority';
import HighPriority from '../../assets/HighPriority';
import LowPriority from '../../assets/LowPriority';

function TaskDetail() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('id');

  const [task, setTask] = useState<any>(null);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  const navigate = useNavigate();

  const fetchTaskDetail = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const [tasksRes, usersRes, commentsRes, repliesRes, attachmentsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users'),
        api.get('/comments'),
        api.get('/replies'),
        api.get('/attachments'),
      ]);

      const tasks = tasksRes.data;
      const users = usersRes.data;
      const allComments = commentsRes.data || [];
      const allReplies = repliesRes.data || [];
      const attachments = attachmentsRes.data;

      setAllUsers(users);

      const foundTask = tasks.find((task: any) => task._id === taskId);

      if (foundTask) {
        setTask(foundTask);

        const assignedUserIds = Array.isArray(foundTask.assignedTo)
          ? foundTask.assignedTo
          : foundTask.assignedTo
            ? [foundTask.assignedTo]
            : [];

        const assigned = users.filter((u: any) => assignedUserIds.includes(u._id));
        setAssignedUsers(assigned);

        const taskComments = allComments.filter((c: any) => c.taskId === foundTask._id);

        const taskReplies = allReplies.filter((r: any) => r.taskId === foundTask._id);

        const mergedComments = [...taskComments, ...taskReplies];
        setComments(mergedComments);

        setAttachments(attachments.filter((att: any) => att.taskId === foundTask._id));
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  // Initialize status when task loads
  useEffect(() => {
    if (task) {
      setStatus(task.status);
    }
  }, [task?._id]);

  const handleSubmitComment = (newComment: any) => {
    setComments([...comments, newComment]);
  };

  const handleUpdateComment = (commentId: string, newContent: string) => {
    setComments(
      comments.map((c: any) =>
        c._id === commentId ? { ...c, content: newContent, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter((c) => c._id !== commentId));
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setTask({ ...task, status: newStatus });
    const taskData = {
      name: task.name,
      priority: task.priority,
      status: newStatus,
    };
    try {
      await api.put(`/tasks/update/${taskId}`, taskData);
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatus(task.status);
      setTask(task);
    }
  };

  const calculateDeadline = (dateStart: string, dateEnd: string) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const calculateDays = calculateDeadline(task?.startDate, task?.endDate);

  const statusOptions = [
    { value: 'to-do', label: 'To Do', bg: '#DFE1E6', color: '#42526E' },
    { value: 'in-progress', label: 'In Progress', bg: '#DEEBFF', color: '#0052CC' },
    { value: 'done', label: 'Done', bg: '#E3FCEF', color: '#006644' },
  ];

  const getStatusOption = (status: string) => {
    const config: any = {
      done: { label: 'DONE', bgcolor: '#4CAF50' },
      'in-progress': { label: 'IN PROGRESS', bgcolor: '#FF9800' },
      'to-do': { label: 'TO DO', bgcolor: '#F44336' },
    };

    const statusConfig = config[status] || config.pending;

    return (
      <Select
        value={status}
        defaultValue={statusConfig.label}
        onChange={(e) => handleStatusChange(e.target.value)}
        size="small"
        sx={{
          height: 32,
          fontSize: '0.8rem',
          fontWeight: 700,
          bgcolor: currentStatus.bg,
          color: currentStatus.color,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .MuiSelect-icon': { color: currentStatus.color },
          borderRadius: 1,
          px: 0.5,
        }}
      >
        {statusOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Typography fontSize="0.8rem" fontWeight={700}>
              {opt.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    );
  };

  const priorityConfig: any = {
    high: { label: 'High', color: '#DE350B', icon: <HighPriority /> },
    medium: { label: 'Medium', color: '#FF991F', icon: <MediumPriority /> },
    low: { label: 'Low', color: '#0065FF', icon: <LowPriority /> },
  };

  const currentStatus = statusOptions.find((s) => s.value === status) ?? {
    value: status,
    label: status,
    bg: '#DFE1E6',
    color: '#42526E',
  };
  const currentPriority = priorityConfig[task?.priority] || priorityConfig.medium;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Task not found
        </Typography>
      </Box>
    );
  }

  const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 1, gap: 3 }}>
      <Typography
        sx={{
          minWidth: 110,
          fontSize: '0.8rem',
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography fontSize="1.5rem" fontWeight="700">
          Task Detail
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '80vh',
          gap: 2,
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: '100%',
            overflowY: 'auto',
            mb: 3,
          }}
        >
          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              mb: 3,
              fontSize: '1.4rem',
              lineHeight: 1.4,
              color: 'text.primary',
              textTransform: 'capitalize',
            }}
          >
            {task.name}
          </Typography>

          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary' }}>
              Description
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                minHeight: 40,
                p: 1.5,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {task.description || (
                <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>
              )}
            </Typography>
          </Box>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Attachments
                  <Chip
                    label={attachments.length}
                    size="small"
                    sx={{ ml: 1, height: 18, fontSize: '0.7rem' }}
                  />
                </Typography>
                <IconButton size="small">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {attachments.map((att: any, index: number) => {
                  let url = att.url;

                  const filename = att.url.split('/').pop();
                  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(filename);

                  return (
                    <Box
                      key={att._id || index}
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: 160,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 3 },
                      }}
                    >
                      <Box
                        sx={{
                          height: 90,
                          bgcolor: '#f4f5f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {isImage ? (
                          <Box
                            component="img"
                            src={url}
                            alt={filename}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <AttachmentIcon sx={{ fontSize: 36, color: '#2196F3' }} />
                        )}
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 600,
                            wordBreak: 'break-all',
                            lineHeight: 1.3,
                          }}
                        >
                          {filename.length > 20 ? filename.slice(0, 20) + '…' : filename}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.65rem' }}
                        >
                          {new Date(att.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Comments Section */}
          <CommentSection
            taskId={task._id}
            comments={comments}
            onSubmit={handleSubmitComment}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
            assignedUsers={allUsers}
          />
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: '40%',
            flexShrink: 0,
            borderLeft: (t) => `1px solid ${t.palette.divider}`,
            overflowY: 'auto',
            py: 3,
            px: 2.5,
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa'),
          }}
        >
          {/* Details Section */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              {getStatusOption(task.status)}
            </Box>

            <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
              Details
            </Typography>

            <DetailRow label="Assignee">
              {assignedUsers.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {assignedUsers.map((u) => (
                    <Box key={u._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={u.avatar} sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                        {u.firstName?.[0]}
                        {u.lastName?.[0]}
                      </Avatar>
                      <Typography fontSize="0.82rem">
                        {u.firstName} {u.lastName}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography fontSize="0.82rem" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Unassigned
                </Typography>
              )}
            </DetailRow>

            <DetailRow label="Priority">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  sx={{ color: currentPriority.color, fontWeight: 700, fontSize: '0.9rem' }}
                >
                  {currentPriority.icon}
                </Typography>
                <Typography
                  fontSize="0.82rem"
                  sx={{ color: currentPriority.color, fontWeight: 600 }}
                >
                  {currentPriority.label}
                </Typography>
              </Box>
            </DetailRow>

            <DetailRow label="Start date">
              <Typography fontSize="0.82rem" color="text.secondary">
                {task.startDate
                  ? new Date(task.startDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'None'}
              </Typography>
            </DetailRow>

            <DetailRow label="Due date">
              {calculateDays <= 0 ? (
                <Typography fontSize="0.82rem" color="red">
                  Expired
                </Typography>
              ) : task.endDate ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: new Date(task.endDate) < new Date() ? '#FFEBE6' : 'transparent',
                    color: new Date(task.endDate) < new Date() ? '#DE350B' : 'text.secondary',
                    px: new Date(task.endDate) < new Date() ? 1 : 0,
                    py: 0.3,
                    borderRadius: 1,
                    fontSize: '0.82rem',
                    fontWeight: new Date(task.endDate) < new Date() ? 600 : 400,
                  }}
                >
                  {new Date(task.endDate) < new Date() && '⚠ '}
                  {new Date(task.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Box>
              ) : (
                <Typography fontSize="0.82rem" color="text.secondary">
                  None
                </Typography>
              )}
            </DetailRow>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Created / Updated */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Created{' '}
              {task.createdAt
                ? new Date(task.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Updated{' '}
              {task.updatedAt
                ? new Date(task.updatedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default TaskDetail;
