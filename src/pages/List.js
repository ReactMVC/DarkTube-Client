import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import YouTube from '@mui/icons-material/YouTube';
import HomeIcon from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/History';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import localForage from 'localforage';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';

export default function List() {
    const navigate = useNavigate();
    const [value, setValue] = React.useState(1);
    const [urls, setUrls] = React.useState([]);
    const [open, setOpen] = React.useState(false);

    const handleNavigation = (newValue) => {
        if (newValue === 0) {
            navigate("/");
        } else if (newValue === 1) {
            navigate("/history");
        }
    };

    React.useEffect(() => {
        document.title = 'DarkTube - History';
        const fetchUrls = async () => {
            const urlsFromDb = await localForage.getItem('urls');
            setUrls(urlsFromDb || []);
        };

        fetchUrls();
    }, []);

    const handleCopy = (url) => {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert("URL successfully copied to clipboard!");
            } else {
                throw new Error('Failed to copy text');
            }
        } catch (error) {
            console.error("Failed to copy text: ", error);
            alert("Failed to copy URL!");
        }

        document.body.removeChild(textArea);
    };

    const handleDeleteAll = async () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmDelete = async () => {
        await localForage.removeItem('urls');
        setUrls([]);
        setOpen(false);
    };

    return (
        <>
            <AppBar position="static" sx={{
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <YouTube sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            DarkTube (Desktop)
                        </Typography>
                        <YouTube sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                        <Typography
                            variant="h5"
                            noWrap
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            DarkTube
                        </Typography>
                        <Button variant="contained" color="secondary" onClick={handleDeleteAll}>
                            Delete All
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>
            <Container maxWidth="sm" sx={{ marginTop: '6rem', marginBottom: '6rem' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {urls.length > 0 ? (
                        [...urls].reverse().map((item, index) => (
                            <Card key={index}>
                                <CardContent>
                                    <Typography sx={{ wordBreak: 'break-all', overflowWrap: 'break-word' }} variant="h6">Title: {item.title}</Typography>
                                    <Typography>Date: {item.date}</Typography>
                                    <Typography sx={{ wordBreak: 'break-all', overflowWrap: 'break-word' }} variant="body1">URL: {item.url}</Typography>
                                    <IconButton onClick={() => handleCopy(item.url)}>
                                        <FileCopyOutlined />
                                    </IconButton>
                                    <IconButton onClick={() => window.open(item.url, '_blank')}>
                                        <YouTube />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="h5" color="textSecondary" align="center">
                            Your history is empty.
                        </Typography>
                    )}
                </Box>
            </Container>
            <Box sx={{
                width: '100%',
                position: 'fixed',
                bottom: 0,
                left: 0
            }}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        handleNavigation(newValue);
                    }}
                >
                    <BottomNavigationAction label="Home" icon={<HomeIcon />} />
                    <BottomNavigationAction label="History" icon={<Settings />} />
                </BottomNavigation>
            </Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete all URLs?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}