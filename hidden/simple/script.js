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

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const chatsContainer = document.getElementById('chats-container');
const friendsContainer = document.getElementById('friends-container');
const requestsContainer = document.getElementById('requests-container');
const chatView = document.getElementById('chat-view');
const chatRecipient = document.getElementById('chat-recipient');
const chatRecipientInitial = document.getElementById('chat-recipient-initial');
const chatRecipientImage = document.getElementById('chat-recipient-image');
const messagesList = document.getElementById('messages-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const chatList = document.getElementById('chat-list');
const friendsList = document.getElementById('friends-list');
const friendRequestsList = document.getElementById('friend-requests-list');
const requestBadge = document.getElementById('request-badge');
const backButton = document.getElementById('back-button');
const tabChats = document.getElementById('tab-chats');
const tabFriends = document.getElementById('tab-friends');
const tabRequests = document.getElementById('tab-requests');
const addFriendButton = document.getElementById('add-friend-button');
const friendUsernameInput = document.getElementById('friend-username');
const searchChatsInput = document.getElementById('search-chats');
const profileModal = document.getElementById('profile-modal');
const editProfileButton = document.getElementById('edit-profile-button');
const closeProfileModal = document.getElementById('close-profile-modal');
const profileNameInput = document.getElementById('profile-name-input');
const saveProfileButton = document.getElementById('save-profile-button');
const profilePictureInput = document.getElementById('profile-picture-input');
const changePictureButton = document.getElementById('change-picture-button');
const profilePicturePreview = document.getElementById('profile-picture-preview');
const profileInitial = document.getElementById('profile-initial');
const profileImage = document.getElementById('profile-image');

// State variables
let currentUser = null;
let currentChat = null;
let currentChatId = null;
let userProfile = null;
let chatListeners = [];

// Auth listeners
document.getElementById('switch-to-register').addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
});

document.getElementById('switch-to-login').addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

document.getElementById('login-button').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      alert(`Login failed: ${error.message}`);
    });
});

document.getElementById('register-button').addEventListener('click', () => {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
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
          
          // Create user profile
          return db.ref('users/' + user.uid).set({
            username: username,
            displayName: username,
            email: email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            profilePicture: null
          }).then(() => {
            // Create username mapping
            return db.ref('usernames/' + username).set(user.uid);
          });
        });
    })
    .catch(error => {
      alert(`Registration failed: ${error.message}`);
    });
});

document.getElementById('logout-button').addEventListener('click', () => {
  auth.signOut();
});

// Tab navigation
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
  requestBadge.classList.add('hidden');
  requestBadge.textContent = '0';
});

// Back button
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

// Profile editing
editProfileButton.addEventListener('click', () => {
  profileModal.classList.remove('hidden');
  
  // Set current values
  profileNameInput.value = userProfile.displayName || userProfile.username;
  
  // Show profile picture or initial
  updateProfilePictureDisplay(profilePicturePreview, profileImage, profileInitial, userProfile);
});

closeProfileModal.addEventListener('click', () => {
  profileModal.classList.add('hidden');
});

saveProfileButton.addEventListener('click', () => {
  const displayName = profileNameInput.value.trim();
  
  if (!displayName) {
    alert('Please enter a display name');
    return;
  }
  
  const updates = {
    displayName: displayName
  };
  
  db.ref(`users/${currentUser.uid}`).update(updates)
    .then(() => {
      userProfile.displayName = displayName;
      alert('Profile updated successfully');
      profileModal.classList.add('hidden');
    })
    .catch(error => {
      alert(`Error updating profile: ${error.message}`);
    });
});

changePictureButton.addEventListener('click', () => {
  profilePictureInput.click();
});

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
    profileImage.src = dataUrl;
    profileImage.classList.remove('hidden');
    profileInitial.classList.add('hidden');
    
    // Save to Firebase
    db.ref(`users/${currentUser.uid}`).update({
      profilePicture: dataUrl
    })
    .then(() => {
      userProfile.profilePicture = dataUrl;
      alert('Profile picture updated successfully');
    })
    .catch(error => {
      alert(`Error updating profile picture: ${error.message}`);
    });
  };
  reader.readAsDataURL(file);
});

// Show/hide send button based on input
messageInput.addEventListener('input', () => {
  if (messageInput.value.trim()) {
    sendButton.classList.remove('hidden');
    micButton.classList.add('hidden');
  } else {
    sendButton.classList.add('hidden');
    micButton.classList.remove('hidden');
  }
});

// Add friend
addFriendButton.addEventListener('click', () => {
  const friendUsername = friendUsernameInput.value.trim();
  
  if (!friendUsername) {
    alert('Please enter a username');
    return;
  }
  
  if (friendUsername === userProfile.username) {
    alert('You cannot add yourself as a friend');
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
      alert(`Error adding friend: ${error.message}`);
    });
});

// Accept friend request
function acceptFriendRequest(friendId) {
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
    alert(`Error accepting friend request: ${error.message}`);
  });
}

// Reject friend request
function rejectFriendRequest(friendId) {
  return Promise.all([
    db.ref(`users/${currentUser.uid}/receivedRequests/${friendId}`).remove(),
    db.ref(`users/${friendId}/sentRequests/${currentUser.uid}`).remove()
  ]).then(() => {
    alert('Friend request rejected');
  }).catch(error => {
    alert(`Error rejecting friend request: ${error.message}`);
  });
}

// Send message
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText || !currentChat) return;
  
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
      sendButton.classList.add('hidden');
      micButton.classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
}

// Create or open chat
function openChat(userId, userData) {
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
      chatRecipient.textContent = userData.displayName || userData.username;
      
      // Set recipient profile picture or initial
      updateProfilePictureDisplay(
        document.getElementById('chat-recipient-picture'),
        chatRecipientImage,
        chatRecipientInitial,
        userData
      );
      
      appContainer.classList.add('hidden');
      chatView.classList.remove('hidden');
      
      // Load messages
      loadMessages(chatId);
      
      // Listen for read status changes
      listenForReadStatusChanges(chatId);
    })
    .catch(error => {
      console.error('Error opening chat:', error);
    });
}

// Load messages for a chat
function loadMessages(chatId) {
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
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Mark message as read if received
    if (message.senderId !== currentUser.uid && !message.read) {
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
    if (message.senderId === currentUser.uid && message.read) {
      const readStatusElement = document.querySelector(`.read-status[data-message-id="${messageId}"]`);
      if (readStatusElement) {
        readStatusElement.textContent = 'Read';
        readStatusElement.classList.add('read');
      }
    }
  });
}

// Add message to UI
function addMessageToUI(message, messageId) {
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

// Mark messages as read
function markMessagesAsRead(chatId) {
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
  db.ref(`chats/${chatId}/messages/${messageId}`).update({ read: true });
}

// Listen for read status changes
function listenForReadStatusChanges(chatId) {
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

// Search chats
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

// Load user chats
function loadChats() {
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
      const participants = Object.keys(chat.participants);
      const otherUserId = participants.find(id => id !== currentUser.uid);
      
      if (otherUserId) {
        chat.otherUserId = otherUserId;
        chats.push(chat);
      }
    });
    
    // Sort by last message timestamp
    chats.sort((a, b) => {
      return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
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
  });
}

// Load chat item
function loadChatItem(chat) {
  db.ref(`users/${chat.otherUserId}`).once('value')
    .then(snapshot => {
      const user = snapshot.val();
      if (!user) return;
      
      // Check if this chat already exists in the list
      const existingChat = document.getElementById(`chat-${chat.id}`);
      if (existingChat) {
        // Update the existing chat item
        const previewElement = existingChat.querySelector('.chat-preview');
        const timeElement = existingChat.querySelector('.chat-time');
        
        if (chat.lastMessage && chat.lastMessage.text) {
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
      
      const chatItem = document.createElement('div');
      chatItem.classList.add('chat-item');
      chatItem.id = `chat-${chat.id}`;
      chatItem.addEventListener('click', () => {
        openChat(chat.otherUserId, user);
      });
      
      const avatarContainer = document.createElement('div');
      avatarContainer.classList.add('profile-picture');
      
      const avatarInitial = document.createElement('span');
      avatarInitial.textContent = (user.displayName || user.username).charAt(0).toUpperCase();
      avatarContainer.appendChild(avatarInitial);
      
      const avatarImage = document.createElement('img');
      avatarImage.classList.add('hidden');
      avatarImage.alt = 'Avatar';
      avatarContainer.appendChild(avatarImage);
      
      // Update avatar if there's a profile picture
      if (user.profilePicture) {
        avatarImage.src = user.profilePicture;
        avatarImage.classList.remove('hidden');
        avatarInitial.classList.add('hidden');
      }
      
      chatItem.appendChild(avatarContainer);
      
      const details = document.createElement('div');
      details.classList.add('chat-details');
      
      const name = document.createElement('div');
      name.classList.add('chat-name');
      name.textContent = user.displayName || user.username;
      details.appendChild(name);
      
      const preview = document.createElement('div');
      preview.classList.add('chat-preview');
      
      if (chat.lastMessage && chat.lastMessage.text) {
        const isCurrentUserSender = chat.lastMessage.senderId === currentUser.uid;
        // Truncate message preview if too long
        let previewText = chat.lastMessage.text;
        if (previewText.length > 30) {
          previewText = previewText.substring(0, 27) + '...';
        }
        preview.textContent = (isCurrentUserSender ? 'You: ' : '') + previewText;
      } else {
        preview.textContent = 'No messages yet';
      }
      
      details.appendChild(preview);
      chatItem.appendChild(details);
      
      const rightSide = document.createElement('div');
      rightSide.classList.add('chat-right');
      
      const time = document.createElement('div');
      time.classList.add('chat-time');
      time.textContent = chat.lastMessage && chat.lastMessage.timestamp ? 
                      formatTime(chat.lastMessage.timestamp) : '';
      rightSide.appendChild(time);
      
      // Unread indicator
      if (chat.lastMessage && chat.lastMessage.senderId !== currentUser.uid && !chat.lastMessage.read) {
        const unreadIndicator = document.createElement('div');
        unreadIndicator.classList.add('unread-indicator');
        rightSide.appendChild(unreadIndicator);
      }
      
      chatItem.appendChild(rightSide);
      
      chatList.appendChild(chatItem);
    });
}

// Load friends
function loadFriends() {
  friendsList.innerHTML = '';
  
  db.ref(`users/${currentUser.uid}/friends`).on('value', snapshot => {
    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
      friendsList.innerHTML = '<p class="empty-list">No friends yet</p>';
      return;
    }
    
    const friendIds = Object.keys(snapshot.val());
    
    // Clear existing friends
    friendsList.innerHTML = '';
    
    // Load each friend
    friendIds.forEach(friendId => {
      db.ref(`users/${friendId}`).once('value')
        .then(snapshot => {
          const friend = snapshot.val();
          if (!friend) return;
          
          const friendItem = document.createElement('div');
          friendItem.classList.add('friend-item');
          
          const avatarContainer = document.createElement('div');
          avatarContainer.classList.add('profile-picture');
          
          const avatarInitial = document.createElement('span');
          avatarInitial.textContent = (friend.displayName || friend.username).charAt(0).toUpperCase();
          avatarContainer.appendChild(avatarInitial);
          
          const avatarImage = document.createElement('img');
          avatarImage.classList.add('hidden');
          avatarImage.alt = 'Avatar';
          avatarContainer.appendChild(avatarImage);
          
          // Update avatar if there's a profile picture
          if (friend.profilePicture) {
            avatarImage.src = friend.profilePicture;
            avatarImage.classList.remove('hidden');
            avatarInitial.classList.add('hidden');
          }
          
          friendItem.appendChild(avatarContainer);
          
          const name = document.createElement('div');
          name.classList.add('friend-name');
          name.textContent = friend.displayName || friend.username;
          friendItem.appendChild(name);
          
          const actionsContainer = document.createElement('div');
          actionsContainer.classList.add('friend-actions');
          
          const messageBtn = document.createElement('button');
          messageBtn.classList.add('action-button');
          messageBtn.textContent = 'Message';
          messageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openChat(friendId, friend);
          });
          actionsContainer.appendChild(messageBtn);
          
          const removeBtn = document.createElement('button');
          removeBtn.classList.add('action-button', 'remove-button');
          removeBtn.textContent = 'Remove';
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove ${friend.displayName || friend.username} from friends?`)) {
              removeFriend(friendId);
            }
          });
          actionsContainer.appendChild(removeBtn);
          
          friendItem.appendChild(actionsContainer);
          friendsList.appendChild(friendItem);
        });
    });
  });
}

// Load friend requests
function loadFriendRequests() {
  friendRequestsList.innerHTML = '';
  let requestCount = 0;
  
  db.ref(`users/${currentUser.uid}/receivedRequests`).on('value', snapshot => {
    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
      friendRequestsList.innerHTML = '<p class="empty-list">No friend requests</p>';
      requestBadge.classList.add('hidden');
      return;
    }
    
    const requestIds = Object.keys(snapshot.val());
    requestCount = requestIds.length;
    
    // Update badge
    if (requestCount > 0) {
      requestBadge.textContent = requestCount;
      requestBadge.classList.remove('hidden');
    } else {
      requestBadge.classList.add('hidden');
    }
    
    // Clear existing requests
    friendRequestsList.innerHTML = '';
    
    // Load each request
    requestIds.forEach(requesterId => {
      db.ref(`users/${requesterId}`).once('value')
        .then(snapshot => {
          const requester = snapshot.val();
          if (!requester) return;
          
          const requestItem = document.createElement('div');
          requestItem.classList.add('request-item');
          
          const avatarContainer = document.createElement('div');
          avatarContainer.classList.add('profile-picture');
          
          const avatarInitial = document.createElement('span');
          avatarInitial.textContent = (requester.displayName || requester.username).charAt(0).toUpperCase();
          avatarContainer.appendChild(avatarInitial);
          
          const avatarImage = document.createElement('img');
          avatarImage.classList.add('hidden');
          avatarImage.alt = 'Avatar';
          avatarContainer.appendChild(avatarImage);
          
          // Update avatar if there's a profile picture
          if (requester.profilePicture) {
            avatarImage.src = requester.profilePicture;
            avatarImage.classList.remove('hidden');
            avatarInitial.classList.add('hidden');
          }
          
          requestItem.appendChild(avatarContainer);
          
          const name = document.createElement('div');
          name.classList.add('request-name');
          name.textContent = requester.displayName || requester.username;
          requestItem.appendChild(name);
          
          const actionsContainer = document.createElement('div');
          actionsContainer.classList.add('request-actions');
          
          const acceptBtn = document.createElement('button');
          acceptBtn.classList.add('action-button', 'accept-button');
          acceptBtn.textContent = 'Accept';
          acceptBtn.addEventListener('click', () => {
            acceptFriendRequest(requesterId);
          });
          actionsContainer.appendChild(acceptBtn);
          
          const rejectBtn = document.createElement('button');
          rejectBtn.classList.add('action-button', 'reject-button');
          rejectBtn.textContent = 'Reject';
          rejectBtn.addEventListener('click', () => {
            rejectFriendRequest(requesterId);
          });
          actionsContainer.appendChild(rejectBtn);
          
          requestItem.appendChild(actionsContainer);
          friendRequestsList.appendChild(requestItem);
        });
    });
  });
}

// Remove friend
function removeFriend(friendId) {
  Promise.all([
    db.ref(`users/${currentUser.uid}/friends/${friendId}`).remove(),
    db.ref(`users/${friendId}/friends/${currentUser.uid}`).remove()
  ])
  .then(() => {
    // Find existing chat between users
    const chatParticipants = [currentUser.uid, friendId].sort();
    const chatId = chatParticipants.join('_');
    
    // Don't remove the chat, just refresh UI
    loadFriends();
  })
  .catch(error => {
    alert(`Error removing friend: ${error.message}`);
  });
}

// Update profile picture display
function updateProfilePictureDisplay(container, imageElement, initialElement, userData) {
  if (userData.profilePicture) {
    imageElement.src = userData.profilePicture;
    imageElement.classList.remove('hidden');
    initialElement.classList.add('hidden');
  } else {
    initialElement.textContent = (userData.displayName || userData.username).charAt(0).toUpperCase();
    initialElement.classList.remove('hidden');
    imageElement.classList.add('hidden');
  }
}

// Auth state change listener
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    
    // Get user profile
    db.ref(`users/${user.uid}`).once('value')
      .then(snapshot => {
        userProfile = snapshot.val();
        
        if (!userProfile) {
          console.error('User profile not found');
          auth.signOut();
          return;
        }
        
        // Update UI with user info
        document.getElementById('user-name').textContent = userProfile.displayName || userProfile.username;
        updateProfilePictureDisplay(
          document.getElementById('profile-picture'), 
          document.getElementById('profile-image'),
          document.getElementById('profile-initial'),
          userProfile
        );
        
        // Show app container
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // Load data
        loadChats();
        loadFriends();
        loadFriendRequests();
      })
      .catch(error => {
        console.error('Error loading user profile:', error);
        auth.signOut();
      });
  } else {
    // Reset state
    currentUser = null;
    userProfile = null;
    currentChat = null;
    currentChatId = null;
    
    // Remove listeners
    chatListeners.forEach(listener => {
      if (listener.ref) {
        listener.ref.off(listener.event);
      }
    });
    chatListeners = [];
    
    // Show auth container
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    chatView.classList.add('hidden');
    
    // Reset forms
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
  }
});

// Voice message functionality
micButton.addEventListener('click', () => {
  // Check if speech recognition is supported
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  // Start listening
  micButton.classList.add('recording');
  recognition.start();
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    messageInput.value = speechResult;
    sendButton.classList.remove('hidden');
    micButton.classList.add('hidden');
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    micButton.classList.remove('recording');
  };
  
  recognition.onend = () => {
    micButton.classList.remove('recording');
  };
});

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  // Initially hide send button
  sendButton.classList.add('hidden');
  
  // Initially show login form
  registerForm.classList.add('hidden');
  
  // Initially hide app container
  appContainer.classList.add('hidden');
  chatView.classList.add('hidden');
  
  // Set active tab
  tabChats.classList.add('active');
  
  // Hide profile modal
  profileModal.classList.add('hidden');
});
