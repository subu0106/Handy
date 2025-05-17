import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Popover from "@mui/material/Popover";

const chatData: Record<string, { name: string; avatar: string; messages: { from: string; text: string; time: string; }[] }> = {
  "1": {
    name: "Alex (Plumber)",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    messages: [
      { from: "Alex", text: "Hi! I saw your request for fixing the kitchen sink.", time: "09:00" },
      { from: "You", text: "Hi Alex! Yes, it’s leaking badly.", time: "09:01" },
      { from: "Alex", text: "I can come tomorrow at 10am. Does that work?", time: "09:02" },
      { from: "You", text: "That’s perfect, thank you!", time: "09:03" },
    ]
  },
  "2": {
    name: "Maria (Painter)",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    messages: [
      { from: "You", text: "Can you send a quote for the living room?", time: "08:30" },
      { from: "Maria", text: "Sure! I’ll send it by noon today.", time: "08:32" },
      { from: "You", text: "Thanks Maria!", time: "08:33" },
    ]
  },
  "3": {
    name: "Handy Support",
    avatar: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    messages: [
      { from: "Support", text: "How can we help you today?", time: "07:00" },
      { from: "You", text: "Just checking how to update my profile.", time: "07:01" },
      { from: "Support", text: "Go to Profile > Edit. Let us know if you need more help!", time: "07:02" },
    ]
  }
};

const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const chat = chatData[chatId || "1"];
  const [message, setMessage] = useState("");
  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);
  const [messages, setMessages] = useState(chat.messages);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { from: "You", text: message, time }]);
      setMessage("");
    }
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchor(event.currentTarget);
  };
  const handleEmojiClose = () => setEmojiAnchor(null);
  const handleEmojiSelect = (emoji: string) => {
    setMessage((msg) => msg + emoji);
    setEmojiAnchor(null);
  };

  // Simple emoji list for demo
  const emojis = ["😀", "👍", "🙏", "🎉", "💡", "🔧", "🖌️", "💬"];

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 4, p: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar src={chat.avatar} alt={chat.name} />
        <Typography variant="h6">{chat.name}</Typography>
      </Paper>
      <Paper elevation={1} sx={{ maxHeight: 340, overflowY: "auto", mb: 2 }}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ justifyContent: msg.from === "You" ? "flex-end" : "flex-start" }}>
              {msg.from !== "You" && (
                <ListItemAvatar>
                  <Avatar src={chat.avatar} />
                </ListItemAvatar>
              )}
              <ListItemText
                primary={msg.text}
                secondary={msg.from + " • " + msg.time}
                sx={{ textAlign: msg.from === "You" ? "right" : "left", maxWidth: 320 }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleEmojiClick}>
                  <EmojiEmotionsIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
        />
        <IconButton color="primary" onClick={handleSend} disabled={!message.trim()}>
          <SendIcon />
        </IconButton>
        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={handleEmojiClose}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Box sx={{ p: 1, display: "flex", gap: 1 }}>
            {emojis.map(e => (
              <IconButton key={e} onClick={() => handleEmojiSelect(e)}>{e}</IconButton>
            ))}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default ChatRoom;
