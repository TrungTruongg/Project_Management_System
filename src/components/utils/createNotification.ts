import axios from "axios";
const API_KEY = import.meta.env.VITE_API_KEY;

export const createNotification = async (data: {
  userId: number[];
  type: string;
  title: string;
  description: string;
  createdBy?: number;
}) => {
  const response = await axios.get(`https://mindx-mockup-server.vercel.app/api/resources/notifications?apiKey=${API_KEY}`);
  const notifications = response.data.data.data;

  const maxId = notifications.length > 0 
    ? Math.max(...notifications.map((n: any) => n.id)) 
    : 0;

  const notification = {
    id: maxId + 1,
    ...data,
    createdAt: new Date().toISOString(),
  };

  await axios.post(`https://mindx-mockup-server.vercel.app/api/resources/notifications?apiKey=${API_KEY}`, notification);
  return notification;
};