import React, { useRef, useState } from "react";
import {
  Modal,
  List,
  Card,
  Button,
  Avatar,
  Input,
  Skeleton,
  Alert,
} from "@mui/material";
import GeminiIcon from "../../assets/GeminiIcon"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "../context/UserContext";

const ChatBox = () => {
  const [openChat, setOpenChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef();
  const { user } = useUser();

  // Thay bằng API key của bạn (khuyến cáo dùng .env)
  const API_KEY = import.meta.env.VITE_GEMINI_KEY;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Khởi tạo chat session để giữ lịch sử cuộc trò chuyện
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `Bạn là một nhân viên chăm sóc y tế, hãy nói chào người dùng với email là: ${users?.email}. Ví dụ: Xin chào anh/chị, example@gmail.com`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
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
      console.log(responseText);

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
    <div>
      <Button
        // icon={<Icon component={GeminiIcon} />}
        onClick={() => setOpenChat(!openChat)}
      />

      <Modal
        open={openChat}
        onCancel={() => setOpenChat(false)}
        title={
          <Space align="center" size={4}>
            <Icon component={GeminiIcon} />
            Trò chuyện với Gemini
          </Space>
        }
        footer={false}
        width={800}
      >
        <Card style={{ height: "400px", overflowY: "auto", marginBottom: 16 }}>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{msg.role === "user" ? "U" : "G"}</Avatar>}
                  title={msg.role === "user" ? "Bạn" : "Gemini"}
                  description={
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Skeleton />
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>

        {errors && (
          <Alert
            message={errors}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <TextArea
          rows={3}
          placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSend}
            loading={loading}
            disabled={!prompt.trim()}
          >
            Gửi
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChatBox;
