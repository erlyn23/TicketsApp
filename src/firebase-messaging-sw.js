importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
    apiKey: "AIzaSyB6KtrgvmtEK26U2UJXozgq89V6Bsyv3FE",
    authDomain: "tuturnorddev.firebaseapp.com",
    databaseURL: "https://tuturnorddev-default-rtdb.firebaseio.com",
    projectId: "tuturnorddev",
    storageBucket: "tuturnorddev.appspot.com",
    messagingSenderId: "211210531678",
    appId: "1:211210531678:web:0e59e05f891a5f25a755cf"
});
const messaging = firebase.messaging();