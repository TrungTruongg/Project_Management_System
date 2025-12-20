// hooks/useUserProjects.ts
import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

export const useUserProjects = (userId: number | undefined) => {
  const [hasProjects, setHasProjects] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProjects = async () => {
      if (!userId) {
        setHasProjects(false);
        setLoading(false);
        return;
      }

      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
          ),
          axios.get(
            `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
          ),
        ]);

        const allProjects = projectsRes.data.data.data;
        const allTasks = tasksRes.data.data.data;

        // Kiểm tra user có trong projects nào không
        const userProjects = allProjects.filter((project: any) => {
          const isMember = project.member?.includes(userId);
          const isLeader = project.leaderId === userId;
          return isMember || isLeader;
        });

        // Kiểm tra user có tasks nào không
        const userTasks = allTasks.filter((task: any) => {
          const isAssigned = Array.isArray(task.assignedTo)
            ? task.assignedTo.includes(userId)
            : task.assignedTo === userId;
          return isAssigned;
        });

        // User có projects hoặc có tasks được giao
        setHasProjects(userProjects.length > 0 || userTasks.length > 0);
      } catch (error) {
        console.error("Error checking user projects:", error);
        setHasProjects(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserProjects();
  }, [userId]);

  return { hasProjects, loading };
};