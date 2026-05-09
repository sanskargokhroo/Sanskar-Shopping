importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDkKU9qlJOrMsM_TXIieUYGmGNhFgJOfEc",
  authDomain: "sanskar-shopping.firebaseapp.com",
  projectId: "sanskar-shopping",
  storageBucket: "sanskar-shopping.firebasestorage.app",
  messagingSenderId: "682795212631",
  appId: "1:682795212631:web:1d38889c84141fdd886812",
  measurementId: "G-BHY7NDT7VV"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo1.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
