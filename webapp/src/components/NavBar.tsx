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

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
}

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl }) => {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        {/* Messages */}
        <IconButton color="inherit" sx={{ ml: 1 }}>
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        {/* Notifications */}
        <IconButton color="inherit" sx={{ ml: 1 }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        {/* Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {userName}
          </Typography>
          <Avatar alt={userName} src={avatarUrl} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
