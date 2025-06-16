import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Notifications, WbSunny, NightlightRound, ExitToApp, HomeRepairService, TokenRounded } from "@mui/icons-material";
import { AppBar, Toolbar, Typography, Menu, MenuItem, Divider, Box, Badge, Avatar } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { auth } from "@config/firebase";
import { useAppSelector } from "@store/hooks";
import { subscribeToUserChats } from "@utils/chatUtils";

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
  onToggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl, onToggleTheme }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const isDark = theme.palette.mode === "dark";
  const user = useAppSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Subscribe to unread chat count
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

  const buttonBoxStyle = {
    cursor: "pointer",
    borderRadius: 2,
    p: 0.8,
    mx: 1,
    boxShadow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease-in-out",
    bgcolor: alpha(theme.palette.text.primary, isDark ? 0.2 : 0.5),
    "&:hover": {
      bgcolor: alpha(theme.palette.text.primary, isDark ? 0.35 : 0.8),
    },
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        {/* Logo & Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <HomeRepairService
            sx={{ mr: 1, fontSize: 28, color: "inherit", cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          />
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
            onClick={() => navigate("/dashboard")}
          >
            Handy
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Button Group */}
        <Box sx={{ display: "flex", alignItems: "center" }}>

          <Box onClick={() => navigate("/dashboard/purchase")} aria-label="purchase tokens" sx={{
            ...buttonBoxStyle,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5
          }}>
            <TokenRounded fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {user.platform_tokens || 0}
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <Box onClick={onToggleTheme} aria-label="toggle theme" sx={buttonBoxStyle}>
            {themeMode === "dark" ? <WbSunny fontSize="small" /> : <NightlightRound fontSize="small" />}
          </Box>

          {/* Messages */}
          <Box onClick={() => navigate("/dashboard/chats")} aria-label="messages" sx={buttonBoxStyle}>
            <Badge badgeContent={unreadCount} color="error">
              <Mail fontSize="small" />
            </Badge>
          </Box>

          {/* Notifications */}
          <Box aria-label="notifications" sx={buttonBoxStyle}>
            <Badge badgeContent={0} color="error">
              <Notifications fontSize="small" />
            </Badge>
          </Box>

          {/* Profile */}
          <Box sx={{ ...buttonBoxStyle, ml: 1 }} onClick={handleProfileClick} aria-label="profile menu">
            <Avatar src={avatarUrl} alt={userName} sx={{ width: 35, height: 35 }} />
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 220,
                borderRadius: 2,
                boxShadow: 3,
                mt: 1,
                p: 0,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 1.2,
              px: 1.5,
              gap: 0.3,
            }}
          >
            <Avatar src={avatarUrl} alt={userName} sx={{ width: 40, height: 40, mb: 0.5 }} />
            <Typography variant="subtitle2" fontWeight={600} align="center" sx={{ fontSize: 15 }}>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center">
              {user.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : "User"}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.3 }} />

          <MenuItem
            onClick={handleLogout}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 0.8,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            <ExitToApp fontSize="small" sx={{ mb: 0.2 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, mt: 0.2 }}>
              Sign out
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
