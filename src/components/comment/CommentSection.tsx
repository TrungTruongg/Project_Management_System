import { Avatar, Box, Button, Card, CardContent, Divider, IconButton, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from 'axios';

function CommentSection({
  taskId,
  comments,
  onSubmit,
  onDelete,
  assignedUsers = [], }: any) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const maxId =
        comments.length > 0 ? Math.max(...comments.map((comment: any) => comment.id)) : 0;

      const comment = {
        id: maxId + 1,
        taskId: taskId,
        userId: user.id,
        content: newComment,
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post(
        "https://mindx-mockup-server.vercel.app/api/resources/comments?apiKey=69205e8dbf3939eacf2e89f2",
        comment
      );

      onSubmit(response.data.data);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number, commentDbId: string) => {
    try {
      await axios.delete(
        `https://mindx-mockup-server.vercel.app/api/resources/comments/${commentDbId}?apiKey=69205e8dbf3939eacf2e89f2`
      );

      onDelete(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);

    if (isNaN(time.getTime()) || time > now) {
      return "Just now";
    }

    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const getUserById = (userId: number) => {
    return assignedUsers.find((u: any) => u.id === userId) || user;
  };

  return (
    <Card
      sx={{
        boxShadow: 2,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
          Comments ({comments.length})
        </Typography>

        {/* Comment Input */}
        {user && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#E0E0E0",
                  textTransform: "uppercase",
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.95rem",
                    },
                  }}
                />
                <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    sx={{
                      textTransform: "none",
                      bgcolor: "#9333ea",
                      "&:hover": {
                        bgcolor: "#7e22ce",
                      },
                    }}
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Comments List */}
        {comments.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {comments.map((comment: any) => {
              const commentUser = getUserById(comment.userId);
              console.log(comment)
              return (
                <Box
                  key={comment.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <Avatar
                    src={commentUser?.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#E0E0E0",
                      textTransform: "uppercase",
                    }}
                  >
                    {commentUser?.firstName?.[0]}
                    {commentUser?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        bgcolor: "#f5f5f5",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {commentUser
                              ? `${commentUser.firstName} ${commentUser.lastName}`
                              : "Unknown User"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {getTimeAgo(comment.createdAt)}
                          </Typography>
                        </Box>
                        {user && comment.userId === user.id && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteComment(comment.id, comment._id)
                            }
                            sx={{ color: "#EF5350" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CommentSection
