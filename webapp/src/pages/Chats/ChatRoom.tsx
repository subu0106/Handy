import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  AppBar,
  Toolbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppSelector } from '@store/hooks';
import { subscribeToMessages, sendMessage } from '../../utils/chatUtils';
import type { Message } from '../../utils/chatUtils';
import { database } from '../../firebase';
import { ref, get } from 'firebase/database';

const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    // Get chat info to display other user's name
    const getChatInfo = async () => {
      const chatRef = ref(database, `chats/${chatId}`);
      const snapshot = await get(chatRef);
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const otherUserId = chatData.participants.find((id: string) => id !== user.uid);
        setOtherUserName(chatData.participantNames[otherUserId] || 'Unknown User');
      }
    };

    getChatInfo();

    const unsubscribe = subscribeToMessages(chatId, (chatMessages) => {
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [chatId, user.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user.uid) return;

    try {
      await sendMessage(chatId, user.uid, user.name, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/chats')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ mr: 2 }}>{otherUserName.charAt(0)}</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {otherUserName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                justifyContent: message.senderId === user.uid ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.senderId === user.uid ? 'primary.main' : 'grey.100',
                  color: message.senderId === user.uid ? 'white' : 'black'
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                  {formatTime(message.timestamp)}
                </Typography>
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatRoom;
