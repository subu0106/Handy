import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  List,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  ListItemButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { subscribeToUserChats, subscribeToMessages, sendMessage } from "../../utils/chatUtils";
import type { Chat, Message } from "../../utils/chatUtils";

const WhatsAppChat: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useAppSelector((state) => state.user);
  const isDarkMode = theme.palette.mode === "dark";
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // WhatsApp-like theme colors
  const whatsappTheme = {
    background: isDarkMode ? "#0b141a" : "#f0f2f5",
    chatListBg: isDarkMode ? "#202c33" : "#ffffff",
    chatHeaderBg: isDarkMode ? "#202c33" : "#f0f2f5",
    messagesBg: isDarkMode ? "#0b141a" : "#efeae2",
    ownMessageBg: isDarkMode ? "#005c4b" : "#dcf8c6",
    otherMessageBg: isDarkMode ? "#202c33" : "#ffffff",
    textPrimary: isDarkMode ? "#e9edef" : "#111b21",
    textSecondary: isDarkMode ? "#8696a0" : "#667781",
    borderColor: isDarkMode ? "#2a3942" : "#e9edef",
    hoverBg: isDarkMode ? "#2a3942" : "#f5f5f5",
    selectedBg: isDarkMode ? "#2a3942" : "#e3f2fd",
  };

  // Subscribe to user's chats
  useEffect(() => {
    if (!user.uid) return;

    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Handle URL parameter for automatic chat selection
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const targetChat = chats.find((chat) => chat.id === chatId);
      if (targetChat) {
        setSelectedChatId(chatId);
        setOtherUserName(getOtherUserName(targetChat));
      }
    }
  }, [chatId, chats]);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!selectedChatId) return;

    const unsubscribe = subscribeToMessages(selectedChatId, (chatMessages) => {
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [selectedChatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        try {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        } catch (error) {
          // Fallback if scrollIntoView fails
          console.warn("Scroll to bottom failed:", error);
        }
      }
    };

    // Use setTimeout to ensure DOM is updated
    if (messages.length > 0) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  const getOtherUserName = (chat: Chat) => {
    const otherUserId = chat.participants.find((id) => id !== user.uid);
    return chat.participantNames[otherUserId!] || "Unknown User";
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChatId(chat.id!);
    setOtherUserName(getOtherUserName(chat));
    // Navigate to the chat URL to maintain URL state
    navigate(`/dashboard/chats/${chat.id}`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !user.name || !user.uid) return;

    try {
      await sendMessage(selectedChatId, user.uid, user.name, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter((chat) => {
    const otherUserName = getOtherUserName(chat);
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Mobile view: show only chat list or selected chat
  if (isMobile) {
    if (selectedChatId) {
      return (
        <Box
          sx={{
            height: "calc(100vh - 64px)", // Account for navbar height (64px)
            display: "flex",
            flexDirection: "column",
            backgroundColor: whatsappTheme.background,
            position: "fixed",
            top: 64, // Start below navbar
            left: 0,
            right: 0,
            zIndex: 1100, // Above other content but below modals
          }}
        >
          {/* Mobile Chat Header */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: whatsappTheme.chatHeaderBg,
              color: whatsappTheme.textPrimary,
              borderRadius: 0,
            }}
          >
            <IconButton onClick={() => navigate("/dashboard/chats")} sx={{ color: whatsappTheme.textPrimary }}>
              <ArrowBackIcon />
            </IconButton>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "#00a884" }}>{otherUserName.charAt(0).toUpperCase()}</Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: whatsappTheme.textPrimary }}>
              {otherUserName}
            </Typography>
          </Paper>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1,
              backgroundColor: whatsappTheme.messagesBg,
              backgroundImage: isDarkMode
                ? "none"
                : 'url("data:image/svg+xml,%3Csvg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M24.37 16c.2.65.39 1.32.54 2H21.17l1.17-2H24.37zm-8.59-6.5c-.28-.96-.404-1.95-.395-2.94-.005-.99.11-1.98.33-2.94H8.5l-.395 2.94c-.404.99-.28 1.98.33 2.94H8.5z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          >
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === user.uid;
              const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== message.senderId);
              const showName = !isOwnMessage && showAvatar;

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                    mb: 1,
                    alignItems: "flex-start",
                    gap: 1,
                    ml: !isOwnMessage && !showAvatar ? 4 : 0, // Indent grouped messages (smaller on mobile)
                  }}
                >
                  {showAvatar && (
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#00a884", fontSize: "0.75rem" }}>
                      {(message.senderName || otherUserName).charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: "75%" }}>
                    {showName && (
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 1,
                          mb: 0.5,
                          display: "block",
                          color: whatsappTheme.textSecondary,
                        }}
                      >
                        {message.senderName || otherUserName}
                      </Typography>
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: isOwnMessage ? whatsappTheme.ownMessageBg : whatsappTheme.otherMessageBg,
                        borderRadius: isOwnMessage ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        border: isDarkMode ? `1px solid ${whatsappTheme.borderColor}` : "none",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: whatsappTheme.textPrimary }}>
                        {message.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 0.5,
                          color: whatsappTheme.textSecondary,
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: whatsappTheme.borderColor,
              backgroundColor: whatsappTheme.chatHeaderBg,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "24px",
                    backgroundColor: whatsappTheme.otherMessageBg,
                    color: whatsappTheme.textPrimary,
                    "& fieldset": {
                      borderColor: whatsappTheme.borderColor,
                    },
                    "&:hover fieldset": {
                      borderColor: whatsappTheme.borderColor,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00a884",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: whatsappTheme.textSecondary,
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{
                  backgroundColor: "#00a884",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#008f72",
                  },
                  "&:disabled": {
                    backgroundColor: whatsappTheme.borderColor,
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)", // Account for navbar height (64px)
        display: "flex",
        backgroundColor: whatsappTheme.background,
        position: "fixed",
        top: 64, // Start below navbar
        left: 0,
        right: 0,
        overflow: "hidden",
        zIndex: 1100, // Above other content but below modals
      }}
    >
      {/* Chat List Panel */}
      <Box
        sx={{
          width: isMobile ? "100%" : 360,
          display: isMobile && selectedChatId ? "none" : "flex",
          flexDirection: "column",
          borderRight: isMobile ? "none" : 1,
          borderColor: whatsappTheme.borderColor,
          backgroundColor: whatsappTheme.chatListBg,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: whatsappTheme.borderColor,
            backgroundColor: whatsappTheme.chatHeaderBg,
          }}
        >
          {/* Title Section - Same level as contact header */}
          <Box
            sx={{
              p: 2,
              pb: 1,
              display: "flex",
              alignItems: "center",
              minHeight: "72px", // Match contact header height
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: whatsappTheme.textPrimary,
              }}
            >
              Chats
            </Typography>
          </Box>

          {/* Search Section - Below title */}
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: whatsappTheme.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                  backgroundColor: whatsappTheme.otherMessageBg,
                  color: whatsappTheme.textPrimary,
                  "& fieldset": {
                    borderColor: whatsappTheme.borderColor,
                  },
                  "&:hover fieldset": {
                    borderColor: whatsappTheme.borderColor,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00a884",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: whatsappTheme.textSecondary,
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* Chat List */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <List sx={{ p: 0 }}>
            {filteredChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: whatsappTheme.textPrimary,
                    mb: 1,
                  }}
                >
                  {chats.length === 0 ? "No conversations yet" : "No matching conversations"}
                </Typography>
                <Typography variant="body2" sx={{ color: whatsappTheme.textSecondary }}>
                  {chats.length === 0
                    ? "Start a conversation by messaging a provider or consumer"
                    : "Try a different search term"}
                </Typography>
              </Box>
            ) : (
              filteredChats.map((chat) => (
                <ListItemButton
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  selected={selectedChatId === chat.id}
                  sx={{
                    "&:hover": { backgroundColor: whatsappTheme.hoverBg },
                    "&.Mui-selected": {
                      backgroundColor: whatsappTheme.selectedBg,
                      "&:hover": {
                        backgroundColor: whatsappTheme.selectedBg,
                      },
                    },
                    borderBottom: `1px solid ${whatsappTheme.borderColor}`,
                    py: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 50, height: 50, bgcolor: "#00a884" }}>
                      {getOtherUserName(chat).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          color: whatsappTheme.textPrimary,
                        }}
                      >
                        {getOtherUserName(chat)}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: whatsappTheme.textSecondary,
                        }}
                        noWrap
                      >
                        {chat.lastMessage || "No messages yet"}
                      </Typography>
                    }
                  />
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ color: whatsappTheme.textSecondary }}>
                      {formatTime(chat.lastMessageTime)}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))
            )}
          </List>
        </Box>
      </Box>

      {/* Chat Room Panel */}
      {!isMobile && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: 0,
                  backgroundColor: whatsappTheme.chatHeaderBg,
                  borderBottom: `1px solid ${whatsappTheme.borderColor}`,
                  minHeight: "72px", // Match title section height
                }}
              >
                <Avatar sx={{ width: 40, height: 40, bgcolor: "#00a884" }}>
                  {otherUserName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: whatsappTheme.textPrimary,
                    }}
                  >
                    {otherUserName}
                  </Typography>
                </Box>
              </Paper>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  backgroundColor: whatsappTheme.messagesBg,
                  backgroundImage: isDarkMode
                    ? "none"
                    : 'url("data:image/svg+xml,%3Csvg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M24.37 16c.2.65.39 1.32.54 2H21.17l1.17-2H24.37zm-8.59-6.5c-.28-.96-.404-1.95-.395-2.94-.005-.99.11-1.98.33-2.94H8.5l-.395 2.94c-.404.99-.28 1.98.33 2.94H8.5z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              >
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId === user.uid;
                  const showAvatar =
                    !isOwnMessage && (index === 0 || messages[index - 1].senderId !== message.senderId);
                  const showName = !isOwnMessage && showAvatar;

                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: "flex",
                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                        mb: 1,
                        alignItems: "flex-start",
                        gap: 1,
                        ml: !isOwnMessage && !showAvatar ? 5 : 0, // Indent grouped messages
                      }}
                    >
                      {showAvatar && (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#00a884", fontSize: "0.875rem" }}>
                          {(message.senderName || otherUserName).charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box sx={{ maxWidth: "70%" }}>
                        {showName && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 1,
                              mb: 0.5,
                              display: "block",
                              color: whatsappTheme.textSecondary,
                            }}
                          >
                            {message.senderName || otherUserName}
                          </Typography>
                        )}
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            backgroundColor: isOwnMessage ? whatsappTheme.ownMessageBg : whatsappTheme.otherMessageBg,
                            borderRadius: isOwnMessage ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            position: "relative",
                            border: isDarkMode ? `1px solid ${whatsappTheme.borderColor}` : "none",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: whatsappTheme.textPrimary }}>
                            {message.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "right",
                              mt: 0.5,
                              color: whatsappTheme.textSecondary,
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: whatsappTheme.chatHeaderBg,
                  borderTop: `1px solid ${whatsappTheme.borderColor}`,
                }}
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "24px",
                        backgroundColor: whatsappTheme.otherMessageBg,
                        color: whatsappTheme.textPrimary,
                        "& fieldset": {
                          borderColor: whatsappTheme.borderColor,
                        },
                        "&:hover fieldset": {
                          borderColor: whatsappTheme.borderColor,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#00a884",
                        },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: whatsappTheme.textSecondary,
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" sx={{ color: whatsappTheme.textSecondary }}>
                            <EmojiEmotionsIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      backgroundColor: "#00a884",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#008f72",
                      },
                      "&:disabled": {
                        backgroundColor: whatsappTheme.borderColor,
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            // No chat selected state
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: whatsappTheme.messagesBg,
                backgroundImage: isDarkMode
                  ? "none"
                  : 'url("data:image/svg+xml,%3Csvg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M24.37 16c.2.65.39 1.32.54 2H21.17l1.17-2H24.37zm-8.59-6.5c-.28-.96-.404-1.95-.395-2.94-.005-.99.11-1.98.33-2.94H8.5l-.395 2.94c-.404.99-.28 1.98.33 2.94H8.5z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 300,
                    color: whatsappTheme.textPrimary,
                  }}
                >
                  Handy Web
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: 300,
                    mx: "auto",
                    lineHeight: 1.5,
                    color: whatsappTheme.textSecondary,
                  }}
                >
                  Send and receive messages without keeping your phone online.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    opacity: 0.7,
                    color: whatsappTheme.textSecondary,
                  }}
                >
                  Select a chat to start messaging
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WhatsAppChat;
