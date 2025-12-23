import { useRef, useState } from "react";
import {
  Modal,
  Box,
  Button,
  Avatar,
  Skeleton,
  Alert,
  Typography,
  IconButton,
  Paper,
  Fab,
  TextareaAutosize,
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import GeminiIcon from "../../assets/GeminiIcon"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "../context/UserContext";

const GeminiChatBox = () => {
  const [openChat, setOpenChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Thay bằng API key của bạn (khuyến cáo dùng .env)
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Khởi tạo chat session để giữ lịch sử cuộc trò chuyện
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `Bạn là một nhân viên lập trình Web Fullstack chuyên nghiệp, hãy nói chào người dùng với email là: ${user?.lastName}. Ví dụ: Xin chào anh/chị, example@gmail.com`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 6000,
    },
  });

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setError("");
    setLoading(true);
    try {
      const result = await chat.sendMessage(prompt);
      const responseText = result.response.text();

      // Thêm phản hồi từ model vào lịch sử
      setMessages([...newMessages, { role: "model", content: responseText }]);
    } catch (err) {
      setError("Lỗi kết nối Gemini. Kiểm tra API key hoặc mạng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        aria-label="chat"
        onClick={() => setOpenChat(!openChat)}
        sx={{
          position: "fixed",
          bottom: 40,
          right: 25,
          backgroundColor: "white",
          width: 40,
          height: 40,
        }}
      >
        <GeminiIcon  />
      </Fab>

      {/* Modal Chat */}
      <Modal
        open={openChat}
        onClose={() => setOpenChat(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: 800,
            maxWidth: "90vw",
            height: 700,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "skyblue",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GeminiIcon  />
              <Typography variant="h6" fontWeight="600">
                Gemini AI Assistant
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpenChat(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                  }}
                >
                  {msg.role === "user" ? user?.firstName?.[0] : "G"}
                </Avatar>

                <Paper
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    // bgcolor: msg.role === "user" ? "#E8F5E9" : "white",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6"
                    }}
                  >
                    {msg.role === "user" ? "You" : "Gemini"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Avatar sx={{ bgcolor: "#4285F4", width: 36, height: 36 }}>
                  G
                </Avatar>
                <Paper sx={{ p: 2, maxWidth: "70%", borderRadius: 2 }}>
                  <Skeleton variant="text" width={200} />
                  <Skeleton variant="text" width={150} />
                  <Skeleton variant="text" width={180} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Error Alert */}
          {errors && (
            <Box sx={{ px: 2 }}>
              <Alert severity="error" onClose={() => setError("")}>
                {errors}
              </Alert>
            </Box>
          )}

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              bgcolor: "white",
              borderTop: "1px solid #e0e0e0",
            }}
          >   
              <TextareaAutosize
                minRows={3}
                placeholder="Type your question... (Enter to send)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                }}
              />
      
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!prompt.trim() || loading}
              sx={{
               
                bgcolor: "#4285F4",
                "&:hover": {
                  bgcolor: "#357AE8",
                },
                mt: 0.5,
                float: "right"
              }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default GeminiChatBox;
