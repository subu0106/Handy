import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { subscribeToUserChats } from '../../utils/chatUtils';
import type {Chat} from '../../utils/chatUtils';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user.uid) return;

    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const getOtherUserName = (chat: Chat) => {
    const otherUserId = chat.participants.find(id => id !== user.uid);
    return chat.participantNames[otherUserId!] || 'Unknown User';
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUserName = getOtherUserName(chat);
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleChatClick = (chatId: string) => {
    navigate(`/chats/${chatId}`);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Paper elevation={1}>
        <List>
          {filteredChats.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No conversations yet" 
                secondary="Start a conversation by messaging a provider or consumer"
              />
            </ListItem>
          ) : (
            filteredChats.map((chat) => (
              <ListItem
                key={chat.id}
                button
                onClick={() => handleChatClick(chat.id!)}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemAvatar>
                  <Avatar>{getOtherUserName(chat).charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getOtherUserName(chat)}
                  secondary={chat.lastMessage || 'No messages yet'}
                />
                <Typography variant="caption" color="textSecondary">
                  {formatTime(chat.lastMessageTime)}
                </Typography>
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ChatList;