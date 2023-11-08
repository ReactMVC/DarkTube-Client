import * as React from 'react';
import axios from 'axios';
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
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import localForage from 'localforage';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';

export default function Home() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [videoDetails, setVideoDetails] = React.useState(null);
  const [error, setError] = React.useState(null);


  const handleNavigation = (newValue) => {
    if (newValue === 0) {
      navigate("/");
    } else if (newValue === 1) {
      navigate("/history");
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };


  React.useEffect(() => {
    document.title = 'DarkTube - Free YouTube Downloader';
  }, []);

  const saveUrl = async (url, title) => {
    let urls = await localForage.getItem('urls');
    if (!urls) {
      urls = [];
    }
    const date = new Date();
    urls.push({ date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, url, title: title });
    await localForage.setItem('urls', urls);
  };

  const handleYoutube = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://darktube2.onrender.com/api', { url }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      saveUrl(url, response.data.title);
      setVideoDetails({
        thumbnail: response.data.thumbnails[0].url,
        title: response.data.title,
        description: response.data.description,
        views: response.data.viewCount,
        publishDate: response.data.publishDate,
        updateDate: response.data.updateDate,
        thumbnails: response.data.thumbnails,
        formats: response.data.formats,
        channel: response.data.channel,
        allFormats: response.data.allFormats,
      });
    } catch (error) {
      console.error("Failed to download video: ", error);
      if (error.response) {
        if (error.response.status === 400) {
          alert("Bad request. The entered address is not a valid address from the YouTube platform.");
          setError('Bad request. The entered address is not a valid address from the YouTube platform.');
        } else if (error.response.status === 500) {
          alert("Internal Server Error. Please try again later!");
          setError('Internal Server Error. Please try again later!');
        } else {
          alert("Failed to download video!");
          setError('Failed to download video!');
        }
      } else if (error.request) {
        alert("No response received from the server. Please try again later!");
        setError('No response received from the server. Please try again later!');
      } else {
        alert("Failed to download video!");
        setError('Failed to download video!');
      }
    }

    setLoading(false);
  };

  return (
    <>
      <AppBar position="static">
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
          </Toolbar>
        </Container>
      </AppBar>
      {/* Youtube code */}
      <Container maxWidth="sm" sx={{ marginTop: '4rem', marginBottom: '6rem' }}>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4" align="center">
                DarkTube
              </Typography>
              <Typography variant="subtitle1" align="center">
                Enter the URL of the YouTube video you want to download
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleYoutube}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="YouTube URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Box sx={{ marginTop: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Download'}
                  </Button>
                </Box>
                {error && <Alert sx={{ marginTop: '12px' }} severity="error">{error}</Alert>}
              </form>
            </Grid>
          </Grid>
        </Box>
        {videoDetails && (
          <Card sx={{ marginTop: 4, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              title={
                <Typography dir="auto" variant="h6" color="text.primary">
                  {videoDetails.title}
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Published on: {videoDetails.publishDate}, Updated on: {videoDetails.updateDate}
                </Typography>
              }
              avatar={
                <Avatar
                  src={videoDetails.thumbnail}
                  alt="Thumbnail"
                  sx={{ width: 56, height: 56 }}
                />
              }
            />
            <CardContent>
              <Typography sx={{ wordBreak: 'break-all', overflowWrap: 'break-word' }} dir="auto" variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: videoDetails.description.replace(/\n/g, '<br />') }} />
              <Typography variant="body1" color="text.primary" sx={{ marginTop: 2 }}>
                Views: {videoDetails.views}
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ marginTop: 2 }}>
                Channel: <a style={{ textDecoration: 'none', color: '#3758ed' }} href={videoDetails.channel.url} target="_blank" rel="noopener noreferrer">{videoDetails.channel.name}</a>
              </Typography>
              {videoDetails && videoDetails.thumbnails && (
                <List>
                  <Divider sx={{ marginTop: '8px' }} />
                  <Typography sx={{ fontSize: '30px', marginTop: '8px', marginBottom: '8px' }}>Thumbnails</Typography>
                  {videoDetails.thumbnails.map((thumbnail, index) => (
                    <ListItem key={index}>
                      <Button
                        sx={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = thumbnail.url;
                          link.target = '_blank'
                          link.click();
                        }}
                      >
                        Download {thumbnail.width} x {thumbnail.height}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
              {videoDetails && videoDetails.formats && (
                <List>
                  <Divider sx={{ marginTop: '8px' }} />
                  <Typography sx={{ fontSize: '30px', marginTop: '8px', marginBottom: '8px' }}>Videos (with sound)</Typography>
                  {videoDetails.formats.filter(video => video.type === "video").map((video, index) => (
                    <ListItem key={index}>
                      <Button
                        sx={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = video.url;
                          link.target = '_blank'
                          link.click();
                        }}
                      >
                        {video.format} - {video.quality}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
              {videoDetails && videoDetails.formats && (
                <List>
                  <Divider sx={{ marginTop: '8px' }} />
                  <Typography sx={{ fontSize: '30px', marginTop: '8px', marginBottom: '8px' }}>Audios (no video)</Typography>
                  {videoDetails.formats
                    .filter(audio => audio.type === "audio")
                    .sort((a, b) => b.bitrate - a.bitrate)
                    .map((audio, index, self) => {
                      let quality;
                      if (audio.format === 'mp4a') {
                        quality = 'Best';
                      } else {
                        if (index === 0) {
                          quality = 'Best';
                        } else if (index === self.length - 1) {
                          quality = 'Low';
                        } else {
                          quality = 'Medium';
                        }
                      }
                      return (
                        <ListItem key={index}>
                          <Button
                            sx={{ width: '100%' }}
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = audio.url;
                              link.target = '_blank'
                              link.click();
                            }}
                          >
                            {audio.format} - {quality}
                          </Button>
                        </ListItem>
                      );
                    })}
                </List>
              )}
              {videoDetails && videoDetails.allFormats && (
                <List>
                  <Divider sx={{ marginTop: '8px' }} />
                  <Typography sx={{ fontSize: '30px', marginTop: '8px', marginBottom: '8px' }}>Videos (all videos)</Typography>
                  {videoDetails.allFormats.filter(video => video.type === "video").map((video, index) => (
                    <ListItem key={index}>
                      <Button
                        sx={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = video.url;
                          link.target = '_blank'
                          link.click();
                        }}
                      >
                        {video.format} - {video.quality}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

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
    </>
  );
}