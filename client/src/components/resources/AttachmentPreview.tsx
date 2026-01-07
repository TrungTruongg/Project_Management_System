import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react'
import PreviewActionButtons from './PreviewActionButtons';

function AttachmentPreview({ attachment, onDelete }: any) {
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
    const [showModal, setShowModal] = useState(false);
    const [fullUrl, setFullUrl] = useState('');

    useEffect(() => {
        let processedUrl = attachment.url;
        if (processedUrl.startsWith('/uploads/')) {
            const baseURL =  'http://localhost:6969';
            processedUrl = baseURL + processedUrl;
        }
        setFullUrl(processedUrl);

        // Check media type
        const ext = attachment.name?.split('.').pop()?.toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];

        if (imageExts.includes(ext || '')) {
            setMediaType('image');
        } else if (videoExts.includes(ext || '')) {
            setMediaType('video');
        } else {
            setMediaType('none');
        }
    }, [attachment]);

    const handlePreviewClick = () => {
        if (mediaType !== 'none') {
            setShowModal(true);
        }
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
                    bgcolor: "white",
                    overflow: "hidden",
                    cursor: mediaType !== 'none' ? "pointer" : "default",
                }}
                onClick={handlePreviewClick}
            >
                {mediaType === 'image' ? (
                    <img
                        src={fullUrl}
                        alt={attachment.name}
                        loading="lazy"
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
                ) : null}

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
                    onClick={() => setShowModal(false)}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "white",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        ✕
                    </IconButton>
                    {mediaType === 'image' ? (
                        <img
                            src={fullUrl}
                            alt={attachment.name}
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                objectFit: "contain",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : mediaType === 'video' ? (
                        <video
                            src={fullUrl}
                            controls
                            autoPlay
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                objectFit: "contain",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : null}
                </Box>
            )}
        </>
    );
};

export default AttachmentPreview
