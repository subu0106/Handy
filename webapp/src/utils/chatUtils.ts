import { database } from '../firebase';
import { 
  ref, 
  push, 
  onValue, 
  serverTimestamp, 
  set,
  get,
  off,
  update
} from 'firebase/database';

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  createdAt: string;
}

export interface Chat {
  id?: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: number;
  createdAt: number;
}

// Create or get existing chat between two users
export const createOrGetChat = async (
  currentUserId: string, 
  otherUserId: string, 
  currentUserName: string, 
  otherUserName: string
): Promise<string> => {
  try {
    // Check if chat already exists
    const chatsRef = ref(database, 'chats');
    const snapshot = await get(chatsRef);
    
    if (snapshot.exists()) {
      const chats = snapshot.val();
      for (const chatId in chats) {
        const chat = chats[chatId];
        if (chat.participants && 
            chat.participants.includes(currentUserId) && 
            chat.participants.includes(otherUserId)) {
          return chatId;
        }
      }
    }
    
    // Create new chat
    const newChatRef = push(chatsRef);
    const chatId = newChatRef.key!;
    
    await set(newChatRef, {
      participants: [currentUserId, otherUserId],
      participantNames: {
        [currentUserId]: currentUserName,
        [otherUserId]: otherUserName
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return chatId;
  } catch (error) {
    console.error('Error creating or getting chat:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  senderName: string, 
  text: string
) => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Update last message in chat
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Listen to messages in real-time
export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages: Message[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        messages.push({ id: key, ...data[key] });
      });
      // Sort by timestamp
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }
    callback(messages);
  });
  
  return () => off(messagesRef, 'value', unsubscribe);
};

// Get user's chats
export const subscribeToUserChats = (
  userId: string, 
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = ref(database, 'chats');
  
  const unsubscribe = onValue(chatsRef, (snapshot) => {
    const chats: Chat[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const chat = data[key];
        if (chat.participants && chat.participants.includes(userId)) {
          chats.push({ id: key, ...chat });
        }
      });
      // Sort by last message time
      chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    }
    callback(chats);
  });
  
  return () => off(chatsRef, 'value', unsubscribe);
};