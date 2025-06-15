import React, { useState, useEffect } from "react";
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
import { useAppSelector } from "@store/hooks";
import { subscribeToUserChats } from "@utils/chatUtils";
import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useDispatch } from "react-redux";
import { logout } from "@store/userSlice";
import { auth } from "@config/firebase";

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl, themeMode, onToggleTheme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!user.uid) return;

    const unsubscribe = subscribeToUserChats(user.uid, (chats) => {
      setUnreadCount(chats.length);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
    handleProfileClose();
  };

  const handleProfilePage = () => {
    navigate("/dashboard/profile");
    handleProfileClose();
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
            onClick={() => navigate("/dashboard")}
          >
            Handy
          </Typography>
        </Box>
        
        {/* Navigation Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <IconButton color="inherit" onClick={() => navigate("/dashboard/providers")} title="Providers">
            <GroupIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/dashboard/jobs")} title="My Jobs">
            <WorkIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/dashboard/offers")} title="Offers">
            <LocalOfferIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate("/dashboard/register")} title="Register">
            <PersonAddIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Theme Switch Icon */}
        <IconButton onClick={onToggleTheme} color="inherit" sx={{ mr: 1 }} aria-label="toggle theme">
          {themeMode === "dark" ? <WbSunnyIcon /> : <NightlightRoundIcon />}
        </IconButton>
        
        {/* Messages */}
        <IconButton color="inherit" sx={{ ml: 1 }} onClick={() => navigate("/dashboard/chats")}>
          <Badge badgeContent={unreadCount} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        
        {/* Notifications */}
        <IconButton color="inherit" sx={{ ml: 1 }}>
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        {/* Profile with Popup */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
            <Avatar 
              src={avatarUrl} 
              alt={userName} 
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          
          {/* Profile Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {userName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'User'}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Menu Items */}
            <MenuItem onClick={handleProfilePage}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
