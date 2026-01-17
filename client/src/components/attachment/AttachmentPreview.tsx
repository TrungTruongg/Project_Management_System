import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { BsFiletypeXls, BsFiletypeXlsx, BsFiletypeDoc, BsFiletypeDocx, BsFiletypePpt, BsFiletypePptx } from "react-icons/bs";
import { useEffect, useState } from 'react'
import PreviewActionButtons from './PreviewActionButtons';
import * as XLSX from 'xlsx';

function AttachmentPreview({ attachment, onDelete }: any) {
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | 'excel' | 'word' | 'powerpoint' | 'none'>('none');
    const [showModal, setShowModal] = useState(false);
    const [fullUrl, setFullUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState<any>(null);
    const [wordContent, setWordContent] = useState<string>('');

    useEffect(() => {
        let processedUrl = attachment.url;
        if (processedUrl.startsWith('/uploads/')) {
            const baseURL = 'http://localhost:6969';
            processedUrl = baseURL + processedUrl;
        }
        setFullUrl(processedUrl);

        // Check media type
        const ext = attachment.name?.split('.').pop()?.toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
        const docExts = ['txt', 'pdf'];
        const excelExts = ['xls', 'xlsx'];
        const wordExts = ['doc', 'docx'];
        const powerpointExts = ['ppt', 'pptx'];

        if (imageExts.includes(ext || '')) {
            setMediaType('image');
        } else if (videoExts.includes(ext || '')) {
            setMediaType('video');
        } else if (docExts.includes(ext || '')) {
            setMediaType('document');
        } else if (excelExts.includes(ext || '')) {
            setMediaType('excel');
        } else if (wordExts.includes(ext || '')) {
            setMediaType('word');
        } else if (powerpointExts.includes(ext || '')) {
            setMediaType('powerpoint');
        } else {
            setMediaType('none');
        }
    }, [attachment]);

    const handlePreviewClick = async () => {
        if (mediaType === 'none') return;

        setShowModal(true);
        if (mediaType === 'excel' || mediaType === 'word') {
            setLoading(true);
        }

        try {
            if (mediaType === 'excel') {
                const response = await fetch(fullUrl);
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                setExcelData({ data: jsonData, sheetName: workbook.SheetNames[0] });
                setLoading(false);
            } else if (mediaType === 'word') {
                const response = await fetch(fullUrl);
                const arrayBuffer = await response.arrayBuffer();

                const mammoth = await import('mammoth');
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setWordContent(result.value);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading file:', error);
            setLoading(false);
        }
    };

    const getFileIcon = (ext: string) => {
        switch (ext) {
            case 'xlsx':
                return <BsFiletypeXlsx />;
            case 'xls':
                return <BsFiletypeXls />;
            case 'docx':
                return <BsFiletypeDocx />;
            case 'doc':
                return <BsFiletypeDoc />;
            case 'pptx':
                return <BsFiletypePptx />;
            case 'ppt':
                return <BsFiletypePpt />;
            default:
                return '📎';
        }
    };

    const renderExcelPreview = () => {
        if (!excelData || !excelData.data) return null;

        return (
            <Box sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                p: 2,
                bgcolor: 'white'
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {excelData.sheetName}
                </Typography>
                <table style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    fontSize: '14px'
                }}>
                    <tbody>
                        {excelData.data.map((row: any[], rowIndex: number) => (
                            <tr key={rowIndex}>
                                {row.map((cell: any, cellIndex: number) => (
                                    <td key={cellIndex} style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                        backgroundColor: rowIndex === 0 ? '#f5f5f5' : 'white',
                                        fontWeight: rowIndex === 0 ? 'bold' : 'normal'
                                    }}>
                                        {cell?.toString() || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        );
    };

    const renderWordPreview = () => {
        if (!wordContent) return null;

        return (
            <Box sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                p: 4,
                bgcolor: 'white'
            }}>
                <div
                    dangerouslySetInnerHTML={{ __html: wordContent }}
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '1.6',
                        fontSize: '14px'
                    }}
                />
            </Box>
        );
    };

    return (
        <>
            <Box
                sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    bgcolor: ['document', 'excel', 'word'].includes(mediaType) ? "#f5f5f5" : "white",
                    overflow: "hidden",
                    cursor: mediaType !== 'none' ? "pointer" : "default",
                }}
                onClick={handlePreviewClick}
            >
                {mediaType === 'image' ? (
                    <img
                        src={fullUrl}
                        alt={attachment.name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                        }}
                        onError={() => setMediaType('none')}
                    />
                ) : mediaType === 'video' ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video
                            src={fullUrl}
                            controls
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                            onError={() => setMediaType('none')}
                        />
                    </Box>
                ) : ['document', 'excel', 'word', 'powerpoint'].includes(mediaType) ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        {(() => {
                            const ext = attachment.name?.split('.').pop()?.toLowerCase();

                            // For Office files, show icon 
                            if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
                                return (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        gap: 1
                                    }}>
                                        <Typography variant="h3" sx={{ fontSize: 48 }}>
                                            {getFileIcon(ext || '')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center', px: 2 }}>
                                            {attachment.name}
                                        </Typography>
                                    </Box>
                                );
                            }

                            // For PDF and TXT, show iframe preview
                            return (
                                <iframe
                                    src={fullUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        pointerEvents: 'none',
                                    }}
                                    title={attachment.name}
                                />
                            );
                        })()}

                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'transparent',
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                        <Typography variant="body2">
                            {attachment.name}
                        </Typography>
                    </Box>
                )}

                <PreviewActionButtons
                    attachment={{ ...attachment, url: fullUrl }}
                    onDelete={onDelete}
                />
            </Box>

            {showModal && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0, 0, 0, 0.9)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                    }}
                    onClick={() => {
                        setShowModal(false);
                        setLoading(false);
                        setExcelData(null);
                        setWordContent('');
                    }}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "white",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            width: 40,
                            height: 40,
                            fontSize: 24,
                            zIndex: 10000,
                            "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                            setLoading(false);
                            setExcelData(null);
                            setWordContent('');
                        }}
                    >
                        ✕
                    </IconButton>

                    {loading && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <CircularProgress sx={{ color: 'white' }} />
                        </Box>
                    )}

                    {!loading && (
                        <Box
                            sx={{
                                width: '90%',
                                height: '90%',
                                bgcolor: 'white',
                                borderRadius: 1,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {mediaType === 'image' ? (
                                <img
                                    src={fullUrl}
                                    alt={attachment.name}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : mediaType === 'video' ? (
                                <video
                                    src={fullUrl}
                                    controls
                                    autoPlay
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : mediaType === 'excel' ? (
                                renderExcelPreview()
                            ) : mediaType === 'word' ? (
                                renderWordPreview()
                            ) : mediaType === 'document' ? (
                                <iframe
                                    src={attachment.name?.endsWith('.pdf') ? `${fullUrl}#toolbar=0` : fullUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                    title={attachment.name}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        gap: 2,
                                        bgcolor: "#000000e6",
                                        zIndex: 9999,
                                    }}
                                >
                                    <Typography color="white">
                                        There is no preview available for this attachment.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size='small'
                                        href={fullUrl}
                                        download
                                        sx={{ textTransform: "capitalize", fontWeight: 600 }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
};

export default AttachmentPreview