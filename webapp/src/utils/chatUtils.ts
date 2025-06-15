/**
 * Utility functions for chat operations using Firebase Realtime Database.
 * Includes chat creation, messaging, and real-time subscriptions.
 */

import { database } from "@config/firebase";
import { ref, push, onValue, serverTimestamp, set, get, off, update } from "firebase/database";

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

/**
 * Create or get an existing chat between two users.
 * @returns The chat ID.
 */
export const createOrGetChat = async (
  currentUserId: string,
  otherUserId: string,
  currentUserName: string,
  otherUserName: string
): Promise<string> => {
  try {
    // Check if chat already exists
    const chatsRef = ref(database, "chats");
    const snapshot = await get(chatsRef);
    if (snapshot.exists()) {
      const chats = snapshot.val();
      for (const chatId in chats) {
        const chat = chats[chatId];
        if (chat.participants && chat.participants.includes(currentUserId) && chat.participants.includes(otherUserId)) {
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
        [otherUserId]: otherUserName,
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return chatId;
  } catch (error) {
    console.error("Error creating or getting chat:", error);
    throw error;
  }
};

/**
 * Send a message in a chat.
 */
export const sendMessage = async (chatId: string, senderId: string, senderName: string, text: string) => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
    // Update last message in chat
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time messages in a chat.
 * @param chatId - The chat's unique identifier.
 * @param callback - Function to call with the latest messages array.
 * @returns Unsubscribe function to stop listening.
 */
export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void): (() => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const handleSnapshot = (snapshot: any) => {
    const messages: Message[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        messages.push({ id: key, ...data[key] });
      });
      // Sort messages by timestamp ascending
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }
    callback(messages);
  };
  const unsubscribe = onValue(messagesRef, handleSnapshot);
  return () => off(messagesRef, "value", unsubscribe);
};

/**
 * Subscribe to all chats for a user in real-time.
 * @param userId - The user's unique identifier.
 * @param callback - Function to call with the latest chats array.
 * @returns Unsubscribe function to stop listening.
 */
export const subscribeToUserChats = (userId: string, callback: (chats: Chat[]) => void): (() => void) => {
  const chatsRef = ref(database, "chats");
  const handleSnapshot = (snapshot: any) => {
    const chats: Chat[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const chat = data[key];
        if (chat.participants && chat.participants.includes(userId)) {
          chats.push({ id: key, ...chat });
        }
      });
      // Sort chats by last message time descending
      chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    }
    callback(chats);
  };
  const unsubscribe = onValue(chatsRef, handleSnapshot);
  return () => off(chatsRef, "value", unsubscribe);
};
