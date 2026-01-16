import { Box, Paper, Typography } from "@mui/material";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import HighPriority from "../../assets/HighPriority";
import MediumPriority from "../../assets/MediumPriority";
import LowPriority from "../../assets/LowPriority";
import { useNavigate } from "react-router-dom";

interface ChartsProps {
    projects: any[];
    tasks: any[]
}

function ProjectCharts({ projects, tasks }: ChartsProps) {

    const navigate = useNavigate();

    const getUserTasks = () => {
        const projectIds = projects.map(p => p._id);
        return tasks.filter(task => projectIds.includes(task.projectId));
    };

    const userTasks = getUserTasks();

    const getStatusData = () => {
        const completed = userTasks.filter(t => t.status === 'completed').length;
        const inProgress = userTasks.filter(t => t.status === 'in-progress').length;
        const toDo = userTasks.filter(t => t.status === 'to-do').length;

        return [
            { name: 'Done', value: completed, color: '#3b82f6' },
            { name: 'In Progress', value: inProgress, color: '#22c55e' },
            { name: 'To Do', value: toDo, color: '#a855f7' },
        ].filter(item => item.value > 0);
    };

    // Tính toán data cho Priority Breakdown (Bar Chart)
    const getPriorityData = () => {
        const high = userTasks.filter(task => task.priority === 'high').length;
        const medium = userTasks.filter(task => task.priority === 'medium').length;
        const low = userTasks.filter(task => task.priority === 'low').length;

        return [
            { name: 'High', value: high, IconComponent: HighPriority },
            { name: 'Medium', value: medium, IconComponent: MediumPriority },
            { name: 'Low', value: low, IconComponent: LowPriority },
        ];
    };

    const statusData = getStatusData();
    const priorityData = getPriorityData();
    const totalTasks = userTasks.length;

    const CustomStatusTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 0.5 }}>
                        {payload[0].name}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                        {payload[0].value} {payload[0].value === 1 ? 'task' : 'tasks'}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // Custom Tooltip for Priority Chart
    const CustomPriorityTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 0.5 }}>
                        {payload[0].payload.name} Priority
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                        {payload[0].value} {payload[0].value === 1 ? 'task' : 'tasks'}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 5}  
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={2}
                    style={{
                        filter: 'brightness(0.9)', 
                        cursor: 'pointer'
                    }}
                />
            </g>
        );
    };

    // Handle click on pie chart
    const handlePieClick = (data: any) => {
        navigate(`/task?status=${data.status}`);
    };

    // Handle click on bar chart
    const handleBarClick = (data: any) => {
        navigate(`/task?priority=${data.priority}`);
    };

    // Custom label cho donut chart
    const renderCustomLabel = ({ cx, cy }: any) => {
        return (
            <g>
                <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        fill: '#111827'
                    }}
                >
                    {totalTasks}
                </text>
                <text
                    x={cx}
                    y={cy + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: '14px',
                        fill: '#6b7280'
                    }}
                >
                    Total Tasks
                </text>
            </g>
        );
    };

    // Custom tick cho X axis
    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const item = priorityData.find(d => d.name === payload.value);
        const IconComponent = item?.IconComponent;

        return (
            <g transform={`translate(${x},${y})`}>

                {IconComponent && (
                    <foreignObject x={-45} y={-3} width={40} height={20}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IconComponent />
                        </div>
                    </foreignObject>
                )}
                <text
                    x={7}
                    y={0}
                    dy={10}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="12px"
                >
                    {payload.value}
                </text>

            </g>
        );
    };

    return (
        <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
            {/* Status Overview - Donut Chart */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    flex: 1,
                    border: (theme) =>
                        `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '16px' }}>
                    Status Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
                    Get a snapshot of the status of your projects
                </Typography>

                {projects.length === 0 ? (
                    <Box
                        sx={{
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No projects available
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={renderCustomLabel}
                                    labelLine={false}
                                    onClick={handlePieClick}
                                    style={{ cursor: 'pointer' }}
                                    activeShape={renderActiveShape}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomStatusTooltip />} isAnimationActive={false} />
                            </PieChart>
                        </ResponsiveContainer>

                        <Box sx={{ mt: 1 }}>
                            {statusData.map((entry, index) => (
                                <Box
                                    key={`legend-${index}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 0.5,
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#f3f4f6'
                                        }
                                    }}
                                    onClick={() => handlePieClick(entry)}
                                >
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '2px',
                                            bgcolor: entry.color,
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#374151', fontSize: '13px' }}>
                                        {entry.name}: {entry.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Priority Breakdown - Bar Chart */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    flex: 1,
                    border: (theme) =>
                        `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#2a2a2a'}`,
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '16px' }}>
                    Priority Breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
                    Get a holistic view of how work is being prioritized
                </Typography>

                {userTasks.length === 0 ? (
                    <Box
                        sx={{
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No Tasks available
                        </Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={priorityData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                            onClick={handleBarClick}

                        >
                            <XAxis
                                dataKey="name"
                                tick={<CustomXAxisTick />}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                domain={[0, 'dataMax + 1']}
                            />
                            <Tooltip content={<CustomPriorityTooltip />} cursor={false} isAnimationActive={false} />
                            <Bar
                                dataKey="value"
                                fill="#9ca3af"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                                style={{ cursor: 'pointer' }}
                                activeBar={{
                                    fill: '#6b7280',
                                    stroke: '#4b5563',
                                    strokeWidth: 1,
                                    style: { cursor: 'pointer' }
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Paper>
        </Box>
    );
}

export default ProjectCharts;