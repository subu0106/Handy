importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAMDZjWXXctT2k6YULKMsJGnWNhi-jcfds",
  authDomain: "handy-81456.firebaseapp.com",
  projectId: "handy-81456",
  messagingSenderId: "202418796029",
  appId: "1:202418796029:web:1617893c98fc46dbfd9594"
});

const messaging = firebase.messaging();