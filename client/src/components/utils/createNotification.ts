import api from "../api/axiosConfig";

export const createNotification = async (data: {
  userId: string[];
  type: string;
  title: string;
  description: string;
  createdBy?: string;
}) => {
  const notification = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  await api.post("/notifications/create", notification);
  return notification;
};