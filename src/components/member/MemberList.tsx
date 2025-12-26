import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddIcon } from "react-icons/go";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddMemberModal from "./AddMemberModal";
import { useSearch } from "../context/SearchContext";
import { useUser } from "../context/UserContext";

const API_KEY = import.meta.env.VITE_API_KEY;

function MemberList() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const { user } = useUser();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, projectRes, taskRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/tasks?apiKey=${API_KEY}`
        ),
      ]);

      setUsers(userRes.data.data.data);
      setProjects(projectRes.data.data.data);
      setTasks(taskRes.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Get all members (owners and members) from current user's projects
  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter((p) => p.ownerId === user.id || p.members?.includes(user.id));
  };

  const userProjects = getUserProjects();

  const getProjectMembers = () => {
    const memberSet = new Set<number>();
    userProjects.forEach((project) => {
      memberSet.add(project.ownerId);
      project.members?.forEach((m: number) => memberSet.add(m));
    });
    return Array.from(memberSet)
      .map((id) => users.find((u) => u.id === id))
      .filter(Boolean);
  };

  const projectMembers = getProjectMembers();

  // const filteredMembers = projectMembers.filter((member: any) => {
  //   if (!searchTerm.trim()) return true;
  //   const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
  //   return fullName.includes(searchTerm.toLowerCase());
  // });

  const handleAddMember = async (newMember: any) => {
    await fetchAllData();
  };

  // const getTaskCount = (userId: number) => {
  //   return tasks.filter((task: any) => {
  //     if (Array.isArray(task.assignedTo)) {
  //       return task.assignedTo.includes(userId);
  //     }
  //     return task.assignedTo === userId;
  //   }).length;
  // };

  const handleOpenAddMemberModal = (project: any) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  const handleViewProfile = (member: any) => {
    navigate("/member-profile", { state: { memberId: member.id } });
  }

  // Get all unique members from user's projects with owner/member distinction
  const getAllMembers = () => {
    const membersMap = new Map<number, { user: any; isOwner: boolean }>();

    userProjects.forEach((project) => {
      const owner = users.find((u) => u.id === project.ownerId);
      if (owner) {
        membersMap.set(owner.id, { user: owner, isOwner: true });
      }

      project.members?.forEach((memberId: number) => {
        const member = users.find((u) => u.id === memberId);
        if (member && !membersMap.has(memberId)) {
          membersMap.set(memberId, { user: member, isOwner: false });
        }
      });
    });

    return Array.from(membersMap.values());
  };

  const allMembers = getAllMembers();

  const filteredAllMembers = allMembers.filter((memberData: any) => {
    if (!searchTerm.trim()) return true;
    const fullName = `${memberData.user.firstName} ${memberData.user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Members work with
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            onClick={handleOpenAddMemberModal}
            sx={{
              backgroundColor: "#484c7f",
              color: "white",
              textTransform: "none",
              px: 3,
            }}
          >
            Add Members
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : userProjects.length === 0 ? (
        <Typography fontStyle="italic">You haven't joined any projects yet!</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredAllMembers.map((memberData: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={memberData.user.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  textAlign: "center",
                  p: 3,
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: 'action.hover' },
                  cursor: "pointer",
                }}
                onClick={() => handleViewProfile(memberData.user)}
              >
                <Avatar
                  src={memberData.user.avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: 32,
                    bgcolor: memberData.isOwner ? "#FF9800" : "#E0E0E0",
                    color: memberData.isOwner ? "white" : "#424242",
                    fontWeight: 600,
                    margin: "0 auto",
                    mb: 2,
                    textTransform: "uppercase"
                  }}
                >
                  {memberData.user.firstName?.[0]}
                  {memberData.user.lastName?.[0]}
                </Avatar>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 0.5, textTransform: "capitalize" }}>
                  {memberData.user.firstName} {memberData.user.lastName}
                </Typography>
                {memberData.isOwner ? (
                  <Chip
                    label="Leader"
                    size="small"
                    sx={{
                      bgcolor: "#FFF3E0",
                      color: "#E65100",
                      fontSize: "11px",
                      height: "22px",
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                    <Chip
                      label="member"
                      size="small"
                      sx={{
                        fontSize: "11px",
                        height: "22px",
                      }}
                    />
                  </Typography>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <AddMemberModal
        open={open}
        onClose={handleCloseModal}
        onSave={handleAddMember}
        selectedProject={selectedProject}
        allUsers={users}
        allProjects={projects}
      />
    </>
  );
}

export default MemberList;
