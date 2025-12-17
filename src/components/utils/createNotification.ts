import axios from "axios";

export const createNotification = async (data: {
  userId: number[];
  type: string;
  title: string;
  description: string;
  createdBy?: number;
}) => {
  const response = await axios.get("https://mindx-mockup-server.vercel.app/api/resources/notifications?apiKey=69205e8dbf3939eacf2e89f2");
  const notifications = response.data.data.data;

  const maxId = notifications.length > 0 
    ? Math.max(...notifications.map((n: any) => n.id)) 
    : 0;

  const notification = {
    id: maxId + 1,
    ...data,
    createdAt: new Date().toISOString(),
  };

  await axios.post("https://mindx-mockup-server.vercel.app/api/resources/notifications?apiKey=69205e8dbf3939eacf2e89f2", notification);
  return notification;
};