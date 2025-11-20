import { Box, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Typography, Avatar, LinearProgress, Chip } from "@mui/material"
import { projects } from "../constants/constants"

function DashboardProjectInformation() {
  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5'}}>
   
      <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Project Information
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  TITLE
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  DATE START
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  DEADLINE
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  LEADER
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  COMPLETION
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    color: 'text.secondary', 
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #f0f0f0'
                  }}
                >
                  STAGE
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project, index) => (
                <TableRow 
                  key={index} 
                  sx={{ 
                    '&:hover': { bgcolor: '#f9f9f9' },
                    '& td': { borderBottom: '1px solid #f0f0f0' }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {project.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {project.dateStart}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {project.deadline}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '16px', 
                          bgcolor: '#E0E0E0' 
                        }}
                      >
                        {project.avatar}
                      </Avatar>
                      <Typography variant="body2">
                        {project.leader}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.completion}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#E0E0E0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#5C6BC0',
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="600" 
                        sx={{ 
                          minWidth: 35,
                          color: '#5C6BC0'
                        }}
                      >
                        {project.completion}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.stage}
                      size="small"
                      sx={{
                        bgcolor: project.stageColor,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: 24,
                        minWidth: 70
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default DashboardProjectInformation
