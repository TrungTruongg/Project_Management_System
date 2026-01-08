import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import CommentItem from "./CommentItem";
import api from "../api/axiosConfig";

function CommentSection({
  taskId,
  comments,
  onSubmit,
  onDelete,
  assignedUsers = [],
}: any) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {   
      const comment = {
        taskId: taskId,
        userId: user._id,
        content: newComment,
        createdAt: new Date().toISOString(),
      };

      const response = await api.post("/comments/create", comment);

      console.log(response)

      onSubmit(response.data);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!content.trim() || !user) return;

    try { 
      const reply = {
        taskId: taskId,
        userId: user._id,
        commentId: commentId,
        content: content,
        createdAt: new Date().toISOString(),
        // parentId: parentId,
      };

      const response = await api.post("/replies/create", reply);

      onSubmit(response.data);
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/delete/${commentId}`);

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

  const getUserById = (userId: string) => {
    return assignedUsers.find((u: any) => u._id === userId) || user;
  };

  const parentComments = comments.filter((comment: any) => !comment.parentId);
  const getReplies = (commentId: string) => {
    return comments.filter((comment: any) => comment.parentId === commentId);
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
                <Box
                  sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
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
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Comments List */}
        {parentComments.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {parentComments.map((comment: any) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteComment}
                onReply={handleReply}
                getUserById={getUserById}
                getTimeAgo={getTimeAgo}
                replies={getReplies(comment._id)}
                isReply={false}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default CommentSection;
