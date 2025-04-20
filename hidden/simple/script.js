// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTATBOCPb_uGYt5Trmx1EZu7doCR0WWvw",
  authDomain: "spotify-795ab.firebaseapp.com",
  databaseURL: "https://spotify-795ab-default-rtdb.firebaseio.com",
  projectId: "spotify-795ab",
  storageBucket: "spotify-795ab.firebasestorage.app",
  messagingSenderId: "907464366407",
  appId: "1:907464366407:web:1c736b0a36c792ffdb1462"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// DOM Elements - with safe access functions
function safeGetElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID '${id}' not found in the DOM`);
  }
  return element;
}

function safeSetText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function safeAddClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

function safeRemoveClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

// Get elements with safety checks
const authContainer = safeGetElement('auth-container');
const appContainer = safeGetElement('app-container');
const loginForm = safeGetElement('login-form');
const registerForm = safeGetElement('register-form');
const chatsContainer = safeGetElement('chats-container');
const friendsContainer = safeGetElement('friends-container');
const requestsContainer = safeGetElement('requests-container');
const chatView = safeGetElement('chat-view');
const chatRecipient = safeGetElement('chat-recipient');
const chatRecipientInitial = safeGetElement('chat-recipient-initial');
const chatRecipientImage = safeGetElement('chat-recipient-image');
const messagesList = safeGetElement('messages-list');
const messagesContainer = safeGetElement('messages-container');
const messageInput = safeGetElement('message-input');
const sendButton = safeGetElement('send-button');
const micButton = safeGetElement('mic-button');
const chatList = safeGetElement('chat-list');
const friendsList = safeGetElement('friends-list');
const friendRequestsList = safeGetElement('friend-requests-list');
const requestBadge = safeGetElement('request-badge');
const backButton = safeGetElement('back-button');
const tabChats = safeGetElement('tab-chats');
const tabFriends = safeGetElement('tab-friends');
const tabRequests = safeGetElement('tab-requests');
const addFriendButton = safeGetElement('add-friend-button');
const friendUsernameInput = safeGetElement('friend-username');
const searchChatsInput = safeGetElement('search-chats');
const profileModal = safeGetElement('profile-modal');
const editProfileButton = safeGetElement('edit-profile-button');
const closeProfileModal = safeGetElement('close-profile-modal');
const profileNameInput = safeGetElement('profile-name-input');
const saveProfileButton = safeGetElement('save-profile-button');
const profilePictureInput = safeGetElement('profile-picture-input');
const changePictureButton = safeGetElement('change-picture-button');
const profilePicturePreview = safeGetElement('profile-picture-preview');
const profileInitial = safeGetElement('profile-initial');
const profileImage = safeGetElement('profile-image');
const userNameElement = safeGetElement('user-name');

// State variables
let currentUser = null;
let currentChat = null;
let currentChatId = null;
let userProfile = null;
let chatListeners = [];

// Auth listeners - with error handling
const switchToRegister = safeGetElement('switch-to-register');
if (switchToRegister) {
  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
  });
}

const switchToLogin = safeGetElement('switch-to-login');
if (switchToLogin) {
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    if (registerForm) registerForm.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
  });
}

const loginButton = safeGetElement('login-button');
if (loginButton) {
  loginButton.addEventListener('click', () => {
    const loginEmail = safeGetElement('login-email');
    const loginPassword = safeGetElement('login-password');
    
    if (!loginEmail || !loginPassword) {
      console.error('Login form elements not found');
      return;
    }
    
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log("Authentication successful", userCredential);
      })
      .catch(error => {
        console.error("Authentication error:", error.code, error.message);
        alert(`Login failed: ${error.message}`);
      });
  });
}

const registerButton = safeGetElement('register-button');
if (registerButton) {
  registerButton.addEventListener('click', () => {
    const registerUsername = safeGetElement('register-username');
    const registerEmail = safeGetElement('register-email');
    const registerPassword = safeGetElement('register-password');
    
    if (!registerUsername || !registerEmail || !registerPassword) {
      console.error('Register form elements not found');
      return;
    }
    
    const username = registerUsername.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    
    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    // Check if username already exists
    db.ref('usernames').child(username).once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          alert('Username already taken');
          return;
        }
        
        // Create user
        return auth.createUserWithEmailAndPassword(email, password)
          .then(userCredential => {
            const user = userCredential.user;
            console.log("User created successfully", user);
            
            // Create user profile
            return db.ref('users/' + user.uid).set({
              username: username,
              displayName: username,
              email: email,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              profilePicture: null
            }).then(() => {
              console.log("User profile created successfully");
              // Create username mapping
              return db.ref('usernames/' + username).set(user.uid);
            });
          });
      })
      .catch(error => {
        console.error("Registration error:", error.code, error.message);
        alert(`Registration failed: ${error.message}`);
      });
  });
}

const logoutButton = safeGetElement('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
      console.log("User signed out successfully");
    }).catch(error => {
      console.error("Sign out error:", error);
    });
  });
}

// Tab navigation with error handling
if (tabChats && tabFriends && tabRequests && chatsContainer && friendsContainer && requestsContainer) {
  tabChats.addEventListener('click', () => {
    tabChats.classList.add('active');
    tabFriends.classList.remove('active');
    tabRequests.classList.remove('active');
    chatsContainer.classList.remove('hidden');
    friendsContainer.classList.add('hidden');
    requestsContainer.classList.add('hidden');
  });

  tabFriends.addEventListener('click', () => {
    tabFriends.classList.add('active');
    tabChats.classList.remove('active');
    tabRequests.classList.remove('active');
    friendsContainer.classList.remove('hidden');
    chatsContainer.classList.add('hidden');
    requestsContainer.classList.add('hidden');
  });

  tabRequests.addEventListener('click', () => {
    tabRequests.classList.add('active');
    tabChats.classList.remove('active');
    tabFriends.classList.remove('active');
    requestsContainer.classList.remove('hidden');
    chatsContainer.classList.add('hidden');
    friendsContainer.classList.add('hidden');
    
    // Clear badge when viewing requests
    if (requestBadge) {
      requestBadge.classList.add('hidden');
      requestBadge.textContent = '0';
    }
  });
}

// Back button with error handling
if (backButton && chatView && appContainer) {
  backButton.addEventListener('click', () => {
    chatView.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    // Remove any existing chat listeners
    chatListeners.forEach(listener => {
      if (listener.ref) {
        listener.ref.off(listener.event);
      }
    });
    
    chatListeners = [];
    currentChat = null;
    currentChatId = null;
  });
}

// Profile editing with error handling
if (editProfileButton && profileModal) {
  editProfileButton.addEventListener('click', () => {
    profileModal.classList.remove('hidden');
    
    if (profileNameInput && userProfile) {
      // Set current values
      profileNameInput.value = userProfile.displayName || userProfile.username;
    }
    
    // Show profile picture or initial
    if (profilePicturePreview && profileImage && profileInitial && userProfile) {
      updateProfilePictureDisplay(profilePicturePreview, profileImage, profileInitial, userProfile);
    }
  });
}

if (closeProfileModal && profileModal) {
  closeProfileModal.addEventListener('click', () => {
    profileModal.classList.add('hidden');
  });
}

if (saveProfileButton && profileNameInput) {
  saveProfileButton.addEventListener('click', () => {
    const displayName = profileNameInput.value.trim();
    
    if (!displayName) {
      alert('Please enter a display name');
      return;
    }
    
    if (currentUser) {
      const updates = {
        displayName: displayName
      };
    
      db.ref(`users/${currentUser.uid}`).update(updates)
        .then(() => {
          if (userProfile) {
            userProfile.displayName = displayName;
          }
          alert('Profile updated successfully');
          if (profileModal) {
            profileModal.classList.add('hidden');
          }
        })
        .catch(error => {
          console.error("Profile update error:", error);
          alert(`Error updating profile: ${error.message}`);
        });
    }
  });
}

if (changePictureButton && profilePictureInput) {
  changePictureButton.addEventListener('click', () => {
    profilePictureInput.click();
  });
}

if (profilePictureInput && profileImage && profileInitial) {
  profilePictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Please select an image smaller than 1MB');
      return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      
      // Update preview
      if (profileImage && profileInitial) {
        profileImage.src = dataUrl;
        profileImage.classList.remove('hidden');
        profileInitial.classList.add('hidden');
      }
      
      // Save to Firebase
      if (currentUser) {
        db.ref(`users/${currentUser.uid}`).update({
          profilePicture: dataUrl
        })
        .then(() => {
          if (userProfile) {
            userProfile.profilePicture = dataUrl;
          }
          alert('Profile picture updated successfully');
        })
        .catch(error => {
          console.error("Profile picture update error:", error);
          alert(`Error updating profile picture: ${error.message}`);
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

// Show/hide send button based on input
if (messageInput && sendButton && micButton) {
  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
      sendButton.classList.remove('hidden');
      micButton.classList.add('hidden');
    } else {
      sendButton.classList.add('hidden');
      micButton.classList.remove('hidden');
    }
  });
}

// Add friend with error handling
if (addFriendButton && friendUsernameInput) {
  addFriendButton.addEventListener('click', () => {
    const friendUsername = friendUsernameInput.value.trim();
    
    if (!friendUsername) {
      alert('Please enter a username');
      return;
    }
    
    if (!userProfile || friendUsername === userProfile.username) {
      alert('You cannot add yourself as a friend');
      return;
    }
    
    if (!currentUser) {
      console.error("Cannot add friend: currentUser is null");
      return;
    }
    
    // Find user by username
    db.ref('usernames').child(friendUsername).once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          alert('User not found');
          return;
        }
        
        const friendId = snapshot.val();
        
        // Check if already friends or request pending
        return Promise.all([
          db.ref(`users/${currentUser.uid}/friends/${friendId}`).once('value'),
          db.ref(`users/${currentUser.uid}/sentRequests/${friendId}`).once('value'),
          db.ref(`users/${currentUser.uid}/receivedRequests/${friendId}`).once('value')
        ]).then(([friendsSnap, sentSnap, receivedSnap]) => {
          if (friendsSnap.exists()) {
            alert('Already friends with this user');
            return;
          }
          
          if (sentSnap.exists()) {
            alert('Friend request already sent to this user');
            return;
          }
          
          if (receivedSnap.exists()) {
            // Accept request if received
            return acceptFriendRequest(friendId);
          }
          
          // Send friend request
          return Promise.all([
            db.ref(`users/${currentUser.uid}/sentRequests/${friendId}`).set({
              timestamp: firebase.database.ServerValue.TIMESTAMP
            }),
            db.ref(`users/${friendId}/receivedRequests/${currentUser.uid}`).set({
              timestamp: firebase.database.ServerValue.TIMESTAMP
            })
          ]).then(() => {
            friendUsernameInput.value = '';
            alert('Friend request sent');
          });
        });
      })
      .catch(error => {
        console.error("Add friend error:", error);
        alert(`Error adding friend: ${error.message}`);
      });
  });
}

// Accept friend request
function acceptFriendRequest(friendId) {
  if (!currentUser) {
    console.error("Cannot accept friend request: currentUser is null");
    return Promise.reject(new Error("User not logged in"));
  }
  
  return Promise.all([
    // Add to friends list for both users
    db.ref(`users/${currentUser.uid}/friends/${friendId}`).set(true),
    db.ref(`users/${friendId}/friends/${currentUser.uid}`).set(true),
    
    // Remove request
    db.ref(`users/${currentUser.uid}/receivedRequests/${friendId}`).remove(),
    db.ref(`users/${friendId}/sentRequests/${currentUser.uid}`).remove()
  ]).then(() => {
    alert('Friend request accepted');
  }).catch(error => {
    console.error("Accept friend request error:", error);
    alert(`Error accepting friend request: ${error.message}`);
    return Promise.reject(error);
  });
}

// Reject friend request
function rejectFriendRequest(friendId) {
  if (!currentUser) {
    console.error("Cannot reject friend request: currentUser is null");
    return Promise.reject(new Error("User not logged in"));
  }
  
  return Promise.all([
    db.ref(`users/${currentUser.uid}/receivedRequests/${friendId}`).remove(),
    db.ref(`users/${friendId}/sentRequests/${currentUser.uid}`).remove()
  ]).then(() => {
    alert('Friend request rejected');
  }).catch(error => {
    console.error("Reject friend request error:", error);
    alert(`Error rejecting friend request: ${error.message}`);
    return Promise.reject(error);
  });
}

// Send message with error handling
if (sendButton) {
  sendButton.addEventListener('click', sendMessage);
}

if (messageInput) {
  messageInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
}

function sendMessage() {
  if (!messageInput || !currentChat || !currentUser) {
    console.error("Cannot send message: required elements or state is missing");
    return;
  }
  
  const messageText = messageInput.value.trim();
  if (!messageText || !currentChatId) return;
  
  const message = {
    senderId: currentUser.uid,
    text: messageText,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    read: false
  };
  
  db.ref(`chats/${currentChatId}/messages`).push(message)
    .then(() => {
      // Update last message
      return db.ref(`chats/${currentChatId}`).update({
        lastMessage: {
          text: messageText,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          senderId: currentUser.uid
        }
      });
    })
    .then(() => {
      messageInput.value = '';
      if (sendButton && micButton) {
        sendButton.classList.add('hidden');
        micButton.classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
}

// Create or open chat with error handling
function openChat(userId, userData) {
  if (!currentUser) {
    console.error("Cannot open chat: currentUser is null");
    return;
  }
  
  if (!userData) {
    console.error("Cannot open chat: userData is null");
    return;
  }
  
  if (!chatRecipient || !chatView || !appContainer) {
    console.error("Cannot open chat: required DOM elements are missing");
    return;
  }
  
  // Find existing chat between users
  const chatParticipants = [currentUser.uid, userId].sort();
  const chatId = chatParticipants.join('_');
  
  db.ref(`chats/${chatId}`).once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        // Create new chat
        return db.ref(`chats/${chatId}`).set({
          participants: {
            [currentUser.uid]: true,
            [userId]: true
          },
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          lastMessage: {
            text: '',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            senderId: ''
          }
        });
      }
    })
    .then(() => {
      // Open chat
      currentChat = userId;
      currentChatId = chatId;
      
      // Set recipient name
      if (chatRecipient) {
        chatRecipient.textContent = userData.displayName || userData.username;
      }
      
      // Set recipient profile picture or initial
      const recipientPicture = document.getElementById('chat-recipient-picture');
      if (recipientPicture && chatRecipientImage && chatRecipientInitial) {
        updateProfilePictureDisplay(recipientPicture, chatRecipientImage, chatRecipientInitial, userData);
      }
      
      if (appContainer && chatView) {
        appContainer.classList.add('hidden');
        chatView.classList.remove('hidden');
      }
      
      // Load messages
      loadMessages(chatId);
      
      // Listen for read status changes
      listenForReadStatusChanges(chatId);
    })
    .catch(error => {
      console.error('Error opening chat:', error);
    });
}

// Load messages for a chat with error handling
function loadMessages(chatId) {
  if (!messagesList) {
    console.error("Cannot load messages: messagesList is null");
    return;
  }
  
  messagesList.innerHTML = '';
  
  const messagesRef = db.ref(`chats/${chatId}/messages`).orderByChild('timestamp');
  
  // Remove previous listeners
  chatListeners.forEach(listener => {
    if (listener.ref) {
      listener.ref.off(listener.event);
    }
  });
  
  // Add new listener
  chatListeners.push({
    ref: messagesRef,
    event: 'child_added'
  });
  
  messagesRef.on('child_added', snapshot => {
    const message = snapshot.val();
    addMessageToUI(message, snapshot.key);
    
    // Scroll to bottom
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Mark message as read if received
    if (currentUser && message.senderId !== currentUser.uid && !message.read) {
      markMessageAsRead(chatId, snapshot.key);
    }
  });
  
  // Also listen for changes in read status
  const readChangesRef = db.ref(`chats/${chatId}/messages`);
  chatListeners.push({
    ref: readChangesRef,
    event: 'child_changed'
  });
  
  readChangesRef.on('child_changed', snapshot => {
    const message = snapshot.val();
    const messageId = snapshot.key;
    
    // Update read status in UI
    if (currentUser && message.senderId === currentUser.uid && message.read) {
      const readStatusElement = document.querySelector(`.read-status[data-message-id="${messageId}"]`);
      if (readStatusElement) {
        readStatusElement.textContent = 'Read';
        readStatusElement.classList.add('read');
      }
    }
  });
}

// Add message to UI with error handling
function addMessageToUI(message, messageId) {
  if (!messagesList || !currentUser) {
    console.error("Cannot add message to UI: required elements or state is missing");
    return;
  }
  
  const isCurrentUser = message.senderId === currentUser.uid;
  
  const messageGroup = document.createElement('div');
  messageGroup.classList.add('message-group', isCurrentUser ? 'message-group-sent' : 'message-group-received');
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', isCurrentUser ? 'message-sent' : 'message-received');
  
  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.textContent = message.text;
  messageElement.appendChild(messageText);
  
  messageGroup.appendChild(messageElement);
  
  const messageTime = document.createElement('div');
  messageTime.classList.add('message-time');
  messageTime.textContent = formatTime(message.timestamp);
  messageGroup.appendChild(messageTime);
  
  if (isCurrentUser) {
    const readStatus = document.createElement('div');
    readStatus.classList.add('read-status');
    readStatus.dataset.messageId = messageId;
    readStatus.textContent = message.read ? 'Read' : 'Delivered';
    if (message.read) {
      readStatus.classList.add('read');
    }
    messageGroup.appendChild(readStatus);
  }
  
  messagesList.appendChild(messageGroup);
}

// Mark messages as read with error handling
function markMessagesAsRead(chatId) {
  if (!currentUser || !currentChat) {
    console.error("Cannot mark messages as read: required state is missing");
    return;
  }
  
  db.ref(`chats/${chatId}/messages`).orderByChild('senderId').equalTo(currentChat).once('value')
    .then(snapshot => {
      const updates = {};
      
      snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        if (!message.read) {
          updates[`${childSnapshot.key}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        return db.ref(`chats/${chatId}/messages`).update(updates);
      }
    })
    .catch(error => {
      console.error('Error marking messages as read:', error);
    });
}

// Mark single message as read
function markMessageAsRead(chatId, messageId) {
  db.ref(`chats/${chatId}/messages/${messageId}`).update({ read: true })
    .catch(error => {
      console.error("Error marking message as read:", error);
    });
}

// Listen for read status changes with error handling
function listenForReadStatusChanges(chatId) {
  if (!currentUser) {
    console.error("Cannot listen for read status changes: currentUser is null");
    return;
  }
  
  const readStatusRef = db.ref(`chats/${chatId}/messages`).orderByChild('senderId').equalTo(currentUser.uid);
  
  // Add to listeners array
  chatListeners.push({
    ref: readStatusRef,
    event: 'child_changed'
  });
  
  readStatusRef.on('child_changed', snapshot => {
    const message = snapshot.val();
    const messageId = snapshot.key;
    
    if (message.read) {
      const readStatusElement = document.querySelector(`.read-status[data-message-id="${messageId}"]`);
      if (readStatusElement) {
        readStatusElement.textContent = 'Read';
        readStatusElement.classList.add('read');
      }
    }
  });
}

// Format timestamp
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  
  const isSameDay = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
  
  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Search chats with error handling
if (searchChatsInput) {
  searchChatsInput.addEventListener('input', () => {
    const searchTerm = searchChatsInput.value.toLowerCase().trim();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
      const nameElement = item.querySelector('.chat-name');
      const previewElement = item.querySelector('.chat-preview');
      
      if (!nameElement) return;
      
      const name = nameElement.textContent.toLowerCase();
      const preview = previewElement ? previewElement.textContent.toLowerCase() : '';
      
      if (name.includes(searchTerm) || preview.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Load user chats with error handling
function loadChats() {
  if (!chatList || !currentUser) {
    console.error("Cannot load chats: required elements or state is missing");
    return;
  }
  
  chatList.innerHTML = '';
  
  db.ref(`chats`).orderByChild(`participants/${currentUser.uid}`).equalTo(true).on('value', snapshot => {
    if (!snapshot.exists()) {
      chatList.innerHTML = '<p class="empty-list">No conversations yet</p>';
      return;
    }
    
    const chats = [];
    snapshot.forEach(childSnapshot => {
      const chat = childSnapshot.val();
      chat.id = childSnapshot.key;
      
      // Get other participant id
      const participants = Object.keys(chat.participants || {});
      const otherUserId = participants.find(id => id !== currentUser.uid);
      
      if (otherUserId) {
        chat.otherUserId = otherUserId;
        chats.push(chat);
      }
    });
    
    // Sort by last message timestamp
    chats.sort((a, b) => {
      return ((b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
    });
    
    if (chats.length === 0) {
      chatList.innerHTML = '<p class="empty-list">No conversations yet</p>';
      return;
    }
    
    // Clear existing chats
    chatList.innerHTML = '';
    
    // Create chat items - load each only once
    const processedIds = new Set();
    chats.forEach(chat => {
      if (!processedIds.has(chat.id)) {
        processedIds.add(chat.id);
        loadChatItem(chat);
      }
    });
  }, error => {
    console.error("Error loading chats:", error);
    chatList.innerHTML = '<p class="empty-list">Error loading conversations</p>';
  });
}

// Load chat item with error handling
function loadChatItem(chat) {
  if (!chatList || !currentUser) {
    console.error("Cannot load chat item: required elements or state is missing");
    return;
  }
  
  db.ref(`users/${chat.otherUserId}`).once('value')
    .then(snapshot => {
      const user = snapshot.val();
      if (!user) {
        console.warn(`User ${chat.otherUserId} not found`);
        return;
      }
      
      // Check if this chat already exists in the list
      const existingChat = document.getElementById(`chat-${chat.id}`);
      if (existingChat) {
        // Update the existing chat item
        const previewElement = existingChat.querySelector('.chat-preview');
        const timeElement = existingChat.querySelector('.chat-time');
        
        if (previewElement && timeElement && chat.lastMessage && chat.lastMessage.text) {
          const isCurrentUserSender = chat.lastMessage.senderId === currentUser.uid;
          // Truncate message preview if too long
          let previewText = chat.lastMessage.text;
          if (previewText.length > 30) {
            previewText = previewText.substring(0, 27) + '...';
          }
          previewElement.textContent = (isCurrentUserSender ? 'You: ' : '') + previewText;
        timeElement.textContent = formatTime(chat.lastMessage.timestamp);
      }
      
      return;
    }
    
    // Create new chat item
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.id = `chat-${chat.id}`;
    
    // Create chat picture container
    const chatPicture = document.createElement('div');
    chatPicture.classList.add('chat-picture');
    
    // Create chat image and initial
    const chatImage = document.createElement('img');
    chatImage.classList.add('chat-image', 'hidden');
    chatImage.alt = 'Profile Picture';
    
    const chatInitial = document.createElement('div');
    chatInitial.classList.add('chat-initial');
    chatInitial.textContent = (user.displayName || user.username || '?').charAt(0).toUpperCase();
    
    chatPicture.appendChild(chatImage);
    chatPicture.appendChild(chatInitial);
    
    // Show profile picture if available
    if (user.profilePicture) {
      chatImage.src = user.profilePicture;
      chatImage.classList.remove('hidden');
      chatInitial.classList.add('hidden');
    }
    
    // Create chat info
    const chatInfo = document.createElement('div');
    chatInfo.classList.add('chat-info');
    
    const chatNameRow = document.createElement('div');
    chatNameRow.classList.add('chat-name-row');
    
    const chatName = document.createElement('div');
    chatName.classList.add('chat-name');
    chatName.textContent = user.displayName || user.username;
    
    const chatTime = document.createElement('div');
    chatTime.classList.add('chat-time');
    
    chatNameRow.appendChild(chatName);
    chatNameRow.appendChild(chatTime);
    
    const chatPreview = document.createElement('div');
    chatPreview.classList.add('chat-preview');
    
    chatInfo.appendChild(chatNameRow);
    chatInfo.appendChild(chatPreview);
    
    chatItem.appendChild(chatPicture);
    chatItem.appendChild(chatInfo);
    
    // Add unread badge if needed
    if (chat.lastMessage && !chat.lastMessage.read && 
        chat.lastMessage.senderId !== currentUser.uid) {
      const unreadBadge = document.createElement('div');
      unreadBadge.classList.add('unread-badge');
      chatItem.appendChild(unreadBadge);
    }
    
    // Set preview text and time if there's a last message
    if (chat.lastMessage && chat.lastMessage.text) {
      const isCurrentUserSender = chat.lastMessage.senderId === currentUser.uid;
      
      // Truncate message preview if too long
      let previewText = chat.lastMessage.text;
      if (previewText.length > 30) {
        previewText = previewText.substring(0, 27) + '...';
      }
      
      chatPreview.textContent = (isCurrentUserSender ? 'You: ' : '') + previewText;
      chatTime.textContent = formatTime(chat.lastMessage.timestamp);
    }
    
    // Add click event to open chat
    chatItem.addEventListener('click', () => {
      openChat(chat.otherUserId, user);
    });
    
    chatList.appendChild(chatItem);
  })
  .catch(error => {
    console.error(`Error loading chat item for ${chat.otherUserId}:`, error);
  });
}

// Load friends with error handling
function loadFriends() {
  if (!friendsList || !currentUser) {
    console.error("Cannot load friends: required elements or state is missing");
    return;
  }
  
  friendsList.innerHTML = '';
  
  db.ref(`users/${currentUser.uid}/friends`).once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        friendsList.innerHTML = '<p class="empty-list">No friends yet</p>';
        return;
      }
      
      const friendPromises = [];
      snapshot.forEach(childSnapshot => {
        const friendId = childSnapshot.key;
        friendPromises.push(
          db.ref(`users/${friendId}`).once('value')
            .then(friendSnapshot => {
              return {
                id: friendId,
                data: friendSnapshot.val()
              };
            })
        );
      });
      
      return Promise.all(friendPromises);
    })
    .then(friends => {
      if (!friends || friends.length === 0) {
        friendsList.innerHTML = '<p class="empty-list">No friends yet</p>';
        return;
      }
      
      friendsList.innerHTML = '';
      
      // Sort friends alphabetically by displayName or username
      friends.sort((a, b) => {
        const nameA = (a.data.displayName || a.data.username || '').toLowerCase();
        const nameB = (b.data.displayName || b.data.username || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      friends.forEach(friend => {
        createFriendItem(friend.id, friend.data, friendsList);
      });
    })
    .catch(error => {
      console.error("Error loading friends:", error);
      friendsList.innerHTML = '<p class="empty-list">Error loading friends</p>';
    });
}

// Load friend requests with error handling
function loadFriendRequests() {
  if (!friendRequestsList || !currentUser) {
    console.error("Cannot load friend requests: required elements or state is missing");
    return;
  }
  
  friendRequestsList.innerHTML = '';
  
  db.ref(`users/${currentUser.uid}/receivedRequests`).once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        friendRequestsList.innerHTML = '<p class="empty-list">No pending requests</p>';
        return;
      }
      
      const requestPromises = [];
      snapshot.forEach(childSnapshot => {
        const senderId = childSnapshot.key;
        requestPromises.push(
          db.ref(`users/${senderId}`).once('value')
            .then(senderSnapshot => {
              return {
                id: senderId,
                data: senderSnapshot.val(),
                timestamp: childSnapshot.val().timestamp
              };
            })
        );
      });
      
      return Promise.all(requestPromises);
    })
    .then(requests => {
      if (!requests || requests.length === 0) {
        friendRequestsList.innerHTML = '<p class="empty-list">No pending requests</p>';
        return;
      }
      
      friendRequestsList.innerHTML = '';
      
      // Sort requests by timestamp (newest first)
      requests.sort((a, b) => b.timestamp - a.timestamp);
      
      requests.forEach(request => {
        createFriendRequestItem(request.id, request.data);
      });
      
      // Update badge
      updateRequestBadge(requests.length);
    })
    .catch(error => {
      console.error("Error loading friend requests:", error);
      friendRequestsList.innerHTML = '<p class="empty-list">Error loading requests</p>';
    });
}

// Create friend item with error handling
function createFriendItem(friendId, friendData, container) {
  if (!container) {
    console.error("Cannot create friend item: container is null");
    return;
  }
  
  const friendItem = document.createElement('div');
  friendItem.classList.add('friend-item');
  
  // Create profile picture container
  const friendPicture = document.createElement('div');
  friendPicture.classList.add('friend-picture');
  
  // Create friend image and initial
  const friendImage = document.createElement('img');
  friendImage.classList.add('friend-image', 'hidden');
  friendImage.alt = 'Profile Picture';
  
  const friendInitial = document.createElement('div');
  friendInitial.classList.add('friend-initial');
  friendInitial.textContent = (friendData.displayName || friendData.username || '?').charAt(0).toUpperCase();
  
  friendPicture.appendChild(friendImage);
  friendPicture.appendChild(friendInitial);
  
  // Show profile picture if available
  if (friendData.profilePicture) {
    friendImage.src = friendData.profilePicture;
    friendImage.classList.remove('hidden');
    friendInitial.classList.add('hidden');
  }
  
  // Create friend info
  const friendInfo = document.createElement('div');
  friendInfo.classList.add('friend-info');
  
  const friendName = document.createElement('div');
  friendName.classList.add('friend-name');
  friendName.textContent = friendData.displayName || friendData.username;
  
  friendInfo.appendChild(friendName);
  
  // Create friend action button
  const friendAction = document.createElement('button');
  friendAction.classList.add('friend-action');
  friendAction.textContent = 'Message';
  
  // Add click event to open chat
  friendAction.addEventListener('click', () => {
    openChat(friendId, friendData);
  });
  
  friendItem.appendChild(friendPicture);
  friendItem.appendChild(friendInfo);
  friendItem.appendChild(friendAction);
  
  container.appendChild(friendItem);
}

// Create friend request item with error handling
function createFriendRequestItem(senderId, senderData) {
  if (!friendRequestsList) {
    console.error("Cannot create friend request item: friendRequestsList is null");
    return;
  }
  
  const requestItem = document.createElement('div');
  requestItem.classList.add('request-item');
  
  // Create profile picture container
  const requestPicture = document.createElement('div');
  requestPicture.classList.add('request-picture');
  
  // Create request image and initial
  const requestImage = document.createElement('img');
  requestImage.classList.add('request-image', 'hidden');
  requestImage.alt = 'Profile Picture';
  
  const requestInitial = document.createElement('div');
  requestInitial.classList.add('request-initial');
  requestInitial.textContent = (senderData.displayName || senderData.username || '?').charAt(0).toUpperCase();
  
  requestPicture.appendChild(requestImage);
  requestPicture.appendChild(requestInitial);
  
  // Show profile picture if available
  if (senderData.profilePicture) {
    requestImage.src = senderData.profilePicture;
    requestImage.classList.remove('hidden');
    requestInitial.classList.add('hidden');
  }
  
  // Create request info
  const requestInfo = document.createElement('div');
  requestInfo.classList.add('request-info');
  
  const requestName = document.createElement('div');
  requestName.classList.add('request-name');
  requestName.textContent = senderData.displayName || senderData.username;
  
  requestInfo.appendChild(requestName);
  
  // Create request actions
  const requestActions = document.createElement('div');
  requestActions.classList.add('request-actions');
  
  const acceptButton = document.createElement('button');
  acceptButton.classList.add('accept-request');
  acceptButton.textContent = 'Accept';
  
  const rejectButton = document.createElement('button');
  rejectButton.classList.add('reject-request');
  rejectButton.textContent = 'Decline';
  
  // Add click events
  acceptButton.addEventListener('click', () => {
    acceptFriendRequest(senderId)
      .then(() => {
        requestItem.remove();
        loadFriends();
        updateRequestBadge();
      })
      .catch(error => {
        console.error("Error in accept friend request UI:", error);
      });
  });
  
  rejectButton.addEventListener('click', () => {
    rejectFriendRequest(senderId)
      .then(() => {
        requestItem.remove();
        updateRequestBadge();
      })
      .catch(error => {
        console.error("Error in reject friend request UI:", error);
      });
  });
  
  requestActions.appendChild(acceptButton);
  requestActions.appendChild(rejectButton);
  
  requestItem.appendChild(requestPicture);
  requestItem.appendChild(requestInfo);
  requestItem.appendChild(requestActions);
  
  friendRequestsList.appendChild(requestItem);
}

// Update request badge with error handling
function updateRequestBadge(count) {
  if (!requestBadge) return;
  
  if (!count && count !== 0) {
    // Count requests
    db.ref(`users/${currentUser.uid}/receivedRequests`).once('value')
      .then(snapshot => {
        count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        updateBadgeUI(count);
      })
      .catch(error => {
        console.error("Error counting friend requests:", error);
      });
  } else {
    updateBadgeUI(count);
  }
}

function updateBadgeUI(count) {
  if (!requestBadge) return;
  
  if (count > 0) {
    requestBadge.textContent = count;
    requestBadge.classList.remove('hidden');
  } else {
    requestBadge.classList.add('hidden');
  }
}

// Update profile picture display
function updateProfilePictureDisplay(container, imageElement, initialElement, userData) {
  if (!container || !imageElement || !initialElement || !userData) {
    console.error("Cannot update profile picture display: required elements or data is missing");
    return;
  }
  
  if (userData.profilePicture) {
    imageElement.src = userData.profilePicture;
    imageElement.classList.remove('hidden');
    initialElement.classList.add('hidden');
  } else {
    initialElement.textContent = (userData.displayName || userData.username || '?').charAt(0).toUpperCase();
    initialElement.classList.remove('hidden');
    imageElement.classList.add('hidden');
  }
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  // Clear existing listeners
  chatListeners.forEach(listener => {
    if (listener.ref) {
      listener.ref.off(listener.event);
    }
  });
  
  chatListeners = [];
  
  if (user) {
    currentUser = user;
    
    // Show app
    if (authContainer && appContainer) {
      authContainer.classList.add('hidden');
      appContainer.classList.remove('hidden');
    }
    
    // Load user profile
    db.ref(`users/${user.uid}`).once('value')
      .then(snapshot => {
        userProfile = snapshot.val();
        
        // Update UI with user info
        if (profileImage && profileInitial && userNameElement) {
          updateProfilePictureDisplay(document.getElementById('profile-picture'), profileImage, profileInitial, userProfile);
          userNameElement.textContent = userProfile.displayName || userProfile.username;
        }
        
        // Load chats, friends and requests
        loadChats();
        loadFriends();
        loadFriendRequests();
        
        // Listen for new friend requests
        db.ref(`users/${user.uid}/receivedRequests`).on('child_added', () => {
          loadFriendRequests();
        });
        
        db.ref(`users/${user.uid}/receivedRequests`).on('child_removed', () => {
          loadFriendRequests();
        });
      })
      .catch(error => {
        console.error("Error loading user profile:", error);
      });
  } else {
    // Show auth container
    if (authContainer && appContainer && chatView) {
      authContainer.classList.remove('hidden');
      appContainer.classList.add('hidden');
      chatView.classList.add('hidden');
    }
    
    currentUser = null;
    currentChat = null;
    currentChatId = null;
    userProfile = null;
  }
});

// Listen for visibility changes to mark messages as read
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentChatId) {
    markMessagesAsRead(currentChatId);
  }
});

// Listen for focus to mark messages as read
window.addEventListener('focus', () => {
  if (currentChatId) {
    markMessagesAsRead(currentChatId);
  }
});
