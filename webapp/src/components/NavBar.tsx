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
import HomeIcon from "@mui/icons-material/Home";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import WorkIcon from "@mui/icons-material/Work";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl, themeMode, onToggleTheme }) => {
  const navigate = useNavigate();
  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        {/* Home Button and App Name at start */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit" sx={{ mr: 1 }} onClick={() => navigate("/")}>
            <HomeIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              userSelect: "none",
              color: "inherit",
              mr: 2,
            }}
            onClick={() => navigate("/")}
          >
            Handy
          </Typography>
        </Box>
        {/* Navigation Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
          <IconButton color="inherit" onClick={() => navigate("/profile")} title="Profile">
            <AccountCircleIcon />
          </IconButton>
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
          {themeMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
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
