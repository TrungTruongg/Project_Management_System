import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Delete as DeleteIcon, Reply as ReplyIcon } from "@mui/icons-material";
import { useUser } from "../context/UserContext";

function CommentItem({
  comment,
  onDelete,
  onReply,
  getUserById,
  getTimeAgo,
  replies,
  isReply = false,
}: any) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();
  const theme = useTheme();

  const commentUser = getUserById(comment.userId);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setReplyingTo(false);
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        ml: isReply ? 6 : 0,
      }}
    >
      <Avatar
        src={commentUser?.avatar}
        sx={{
          width: isReply ? 32 : 40,
          height: isReply ? 32 : 40,
          bgcolor: "#E0E0E0",
          textTransform: "uppercase",
          fontSize: replyingTo ? "20px" : "13px"
        }}
      >
        {commentUser?.firstName?.[0]}
        {commentUser?.lastName?.[0]}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        {/* Comment Content */}
        <Box
          sx={{
            bgcolor: isReply 
              ? theme.palette.mode === "dark" ? "#2a2a2a" : "#fafafa"
              : theme.palette.mode === "dark" ? "#2a2a2a" : "#f5f5f5",
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
              <Typography variant="caption" color="text.secondary">
                {getTimeAgo(comment.createdAt)}
              </Typography>
            </Box>
            {user && comment.userId === user.id && (
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id, comment._id)}
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

        {/* Reply Button */}
        {!isReply && (
          <Box sx={{ mt: 1, display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => setReplyingTo(true)}
              sx={{
                textTransform: "none",
                fontSize: "0.85rem",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Reply
            </Button>
            {replies.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </Typography>
            )}
          </Box>
        )}

        {/* Reply Input Box */}
        {replyingTo && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#E0E0E0",
                textTransform: "uppercase",
                fontSize: "13px"
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={`Reply to ${commentUser?.firstName}${commentUser?.lastName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                variant="outlined"
                size="small"
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.9rem",
                  },
                }}
              />
              <Box sx={{ mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setReplyingTo(false);
                    setReplyContent("");
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || submitting}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    bgcolor: "#9333ea",
                    "&:hover": {
                      bgcolor: "#7e22ce",
                    },
                  }}
                >
                  {submitting ? "Replying..." : "Reply"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Render Replies */}
        {replies.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2, fontSize: "13px" }}>
            {replies.map((reply: any) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onDelete={onDelete}
                onReply={onReply}
                getUserById={getUserById}
                getTimeAgo={getTimeAgo}
                replies={[]}
                isReply={true}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CommentItem;