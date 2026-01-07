import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { GoPlusCircle as AddIcon } from "react-icons/go";
import { Refresh as RefreshIcon } from "@mui/icons-material";
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const { user } = useUser();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, projectRes] = await Promise.all([
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=${API_KEY}`
        ),
        axios.get(
          `https://mindx-mockup-server.vercel.app/api/resources/projects?apiKey=${API_KEY}`
        )
      ]);

      setUsers(userRes.data.data.data);
      setProjects(projectRes.data.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  // Get projects where the user is the owner
  const getOwnerProjects = () => {
    if (!user) return [];
    return projects.filter((p) => p.ownerId === user.id);
  };

  // Get projects where the user is a member or owner
  const getUserProjects = () => {
    if (!user) return [];
    return projects.filter(
      (p) => p.ownerId === user.id || p.members?.includes(user.id)
    );
  };

  const ownerProjects = getOwnerProjects();
  const userProjects = getUserProjects();

  // Get all unique members from userProjects
  const getAllMembers = () => {
    const membersMap = new Map<number, { user: any; isOwner: boolean }>();

    userProjects.forEach((project) => {
      // Add owner
      const owner = users.find((u) => u.id === project.ownerId);
      if (owner) {
        membersMap.set(owner.id, { user: owner, isOwner: true });
      }

      // Add members
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

  const filteredMembers = allMembers.filter((memberData: any) => {
    if (!searchTerm.trim()) return true;
    const fullName =
      `${memberData.user.firstName} ${memberData.user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleAddMember = async () => {
    await fetchAllData();
  };

  const handleOpenAddMemberModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleViewProfile = (member: any) => {
    navigate("/member-profile", { state: { memberId: member.id } });
  };

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
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="h4" fontWeight="700">
            Members
          </Typography>
          <IconButton
            onClick={fetchAllData}
            disabled={loading}
            sx={{ color: "text.secondary" }}
            title="Refresh members"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            onClick={handleOpenAddMemberModal}
            disabled={ownerProjects.length === 0}
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
        <Typography fontStyle="italic">
          You are not part of any projects yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredMembers.map((memberData: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={memberData.user.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  textAlign: "center",
                  p: 3,
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "action.hover" },
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
                    textTransform: "uppercase",
                  }}
                >
                  {memberData.user.firstName?.[0]}
                  {memberData.user.lastName?.[0]}
                </Avatar>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: "capitalize",
                  }}
                >
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
                  <Chip
                    label="Member"
                    size="small"
                    sx={{
                      fontSize: "11px",
                      height: "22px",
                    }}
                  />
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
        ownerProjects={ownerProjects}
        allUsers={users}
        allProjects={projects}
      />
    </>
  );
}

export default MemberList;