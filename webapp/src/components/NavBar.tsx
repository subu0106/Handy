import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailIcon from "@mui/icons-material/Mail";
import Box from "@mui/material/Box";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import { useNavigate } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import WorkIcon from "@mui/icons-material/Work";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ChatRoomPopover from '../pages/Chats/ChatRoomPopover';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl, themeMode, onToggleTheme }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [messagesAnchorEl, setMessagesAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [selectedNotif, setSelectedNotif] = React.useState<number | null>(null);

  const handleNotifClick = () => {
    setAnchorEl(document.body); // force open
    setMessagesAnchorEl(null); // close messages popover if open
    if (!notifOpen) setSelectedNotif(null); // always reset notification detail view
  };

  const handleNotifClose = () => {
    setAnchorEl(null);
  };

  const notifOpen = Boolean(anchorEl);

  const handleMessagesClick = () => {
    setMessagesAnchorEl(document.body); // force open
    setAnchorEl(null); // close notifications popover if open
    setSelectedChatId(null); // always reset chat detail view
  };

  const handleMessagesClose = () => {
    setMessagesAnchorEl(null);
  };

  const messagesOpen = Boolean(messagesAnchorEl);

  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        {/* Home Button and App Name at start */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Remove HomeIcon button, only keep Handy symbol as home */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              userSelect: "none",
              color: "inherit",
              mr: 2
            }}
            onClick={() => navigate("/")}
          >
            Handy
          </Typography>
        </Box>
        {/* Navigation Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <IconButton color="inherit" onClick={() => navigate("/providers")} title="Providers">
            <GroupIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/jobs")} title="My Jobs">
            <WorkIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/offers")} title="Offers">
            <LocalOfferIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/register")} title="Register">
            <PersonAddIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {/* Theme Switch Icon */}
        <IconButton color="inherit" sx={{ ml: 1 }} onClick={onToggleTheme} aria-label="toggle theme">
          {themeMode === "dark" ? <WbSunnyIcon /> : <NightlightRoundIcon />}
        </IconButton>
        {/* Messages */}
        <IconButton color="inherit" sx={{ ml: 1 }} onClick={handleMessagesClick}>
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        {/* Messages Popover at top right corner with chat preview and inline chat room */}
        <Popover
          open={messagesOpen}
          onClose={handleMessagesClose}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 72, left: typeof window !== 'undefined' ? window.innerWidth - 424 : 0 }}
          PaperProps={{
            sx: {
              minWidth: 340,
              maxWidth: 400,
              maxHeight: 540,
              p: 1.5,
              borderRadius: 2,
              boxShadow: 3,
              overflow: 'visible',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Chats
            </Typography>
            <IconButton size="small" onClick={handleMessagesClose} sx={{ ml: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>&times;</span>
            </IconButton>
          </Box>
          {/* Chat history or inline chat room */}
          {selectedChatId ? (
            <Box sx={{ width: 340, maxWidth: '100%' }}>
              <ChatRoomPopover chatId={selectedChatId} onBack={() => setSelectedChatId(null)} />
            </Box>
          ) : (
            <List>
              <ListItem divider onClick={() => setSelectedChatId('1')} component="button">
                <ListItemText
                  primary="Alex (Plumber)"
                  secondary="Alex: I can come tomorrow at 10am."
                />
              </ListItem>
              <ListItem divider onClick={() => setSelectedChatId('2')} component="button">
                <ListItemText
                  primary="Maria (Painter)"
                  secondary="You: Can you send a quote for the living room?"
                />
              </ListItem>
              <ListItem onClick={() => setSelectedChatId('3')} component="button">
                <ListItemText
                  primary="Handy Support"
                  secondary="Support: How can we help you today?"
                />
              </ListItem>
            </List>
          )}
        </Popover>
        {/* Notifications */}
        <IconButton color="inherit" sx={{ ml: 1 }} onClick={handleNotifClick}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        {/* Notification Popover at top right corner */}
        <Popover
          open={notifOpen}
          onClose={handleNotifClose}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 72, left: typeof window !== 'undefined' ? window.innerWidth - 404 : 0 }}
          PaperProps={{
            sx: {
              minWidth: 320,
              maxWidth: 360,
              maxHeight: 420,
              p: 1.5,
              borderRadius: 2,
              boxShadow: 3,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            <IconButton size="small" onClick={handleNotifClose} sx={{ ml: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>&times;</span>
            </IconButton>
          </Box>
          {selectedNotif === null ? (
            <List dense>
              <ListItem divider component="button" onClick={() => setSelectedNotif(0)}>
                <ListItemText
                  primary="New Offer Received"
                  secondary="You have a new offer for your service request: 'Fix kitchen sink'."
                />
              </ListItem>
              <ListItem divider component="button" onClick={() => setSelectedNotif(1)}>
                <ListItemText
                  primary="Service Request Accepted"
                  secondary="Your request 'Paint living room' was accepted by a provider."
                />
              </ListItem>
              <ListItem component="button" onClick={() => setSelectedNotif(2)}>
                <ListItemText
                  primary="Offer Declined"
                  secondary="Your offer for 'Repair AC unit' was declined."
                />
              </ListItem>
            </List>
          ) : (
            <Box sx={{ p: 1 }}>
              <IconButton size="small" onClick={() => setSelectedNotif(null)} sx={{ mb: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              {selectedNotif === 0 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    New Offer Received
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    You have a new offer for your service request: <b>"Fix kitchen sink"</b>.<br />
                    <br />
                    <b>Provider:</b> Alex (Plumber)<br />
                    <b>Offer Amount:</b> $120<br />
                    <b>Message:</b> I can come tomorrow at 10am to fix your sink. Please confirm if this works for you.
                  </Typography>
                </>
              )}
              {selectedNotif === 1 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Service Request Accepted
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Your request <b>"Paint living room"</b> was accepted by <b>Maria (Painter)</b>.<br />
                    <br />
                    <b>Start Date:</b> May 20, 2025<br />
                    <b>Message:</b> Looking forward to working on your project!
                  </Typography>
                </>
              )}
              {selectedNotif === 2 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Offer Declined
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Your offer for <b>"Repair AC unit"</b> was declined.<br />
                    <br />
                    <b>Reason:</b> The provider is unavailable for the requested dates.<br />
                    <b>Tip:</b> Try sending a new request or contacting another provider.
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Popover>
        {/* Profile (right side, only icon, show info on hover after 2s) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          {(() => {
            const [showTooltip, setShowTooltip] = React.useState(false);
            const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

            const handleMouseEnter = () => {
              hoverTimeout.current = setTimeout(() => setShowTooltip(true), 500);
            };
            const handleMouseLeave = () => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              setShowTooltip(false);
            };
            return (
              <div
                style={{ position: "relative", display: "inline-block" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/profile")}
                  sx={{ p: 0 }}
                >
                  <Avatar alt={userName} src={avatarUrl} />
                </IconButton>
                {showTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-36px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#333",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "0.95rem",
                      whiteSpace: "nowrap",
                      zIndex: "1000",
                    }}
                  >
                    {userName || "Profile"}
                  </div>
                )}
              </div>
            );
          })()}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
