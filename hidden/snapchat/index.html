import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot, 
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import './App.css';

// Firebase configuration from your provided details
const firebaseConfig = {
  apiKey: "AIzaSyDTATBOCPb_uGYt5Trmx1EZu7doCR0WWvw",
  authDomain: "spotify-795ab.firebaseapp.com",
  databaseURL: "https://spotify-795ab-default-rtdb.firebaseio.com",
  projectId: "spotify-795ab",
  storageBucket: "spotify-795ab.firebasestorage.app",
  messagingSenderId: "907464366407",
  appId: "1:907464366407:web:e8915a98e9a3719bdb1462",
  measurementId: "G-TT6RD9XYR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Login Component
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: username
        });
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: username,
          email: email,
          friends: [],
          blockedUsers: [],
          createdAt: serverTimestamp()
        });
        
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="Snapchat" className="login-logo" />
        <h2>{isLogin ? 'Log in to Snapchat' : 'Sign up for Snapchat'}</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="primary-button">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            className="text-button" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Private Route Component
function PrivateRoute({ children }) {
  const { currentUser } = React.useContext(AuthContext);
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Navigation Component 
function Navigation() {
  const navigate = useNavigate();
  
  return (
    <div className="navigation">
      <div className="nav-item" onClick={() => navigate('/camera')}>
        <div className="nav-icon camera-icon">📷</div>
      </div>
      <div className="nav-item" onClick={() => navigate('/chats')}>
        <div className="nav-icon">💬</div>
      </div>
      <div className="nav-item" onClick={() => navigate('/stories')}>
        <div className="nav-icon">👥</div>
      </div>
      <div className="nav-item" onClick={() => navigate('/map')}>
        <div className="nav-icon">🗺️</div>
      </div>
      <div className="nav-item" onClick={() => navigate('/profile')}>
        <div className="nav-icon">👤</div>
      </div>
    </div>
  );
}

// Friends Component
function Friends() {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = React.useContext(AuthContext);
  
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          if (userData.friends && userData.friends.length > 0) {
            const friendPromises = userData.friends.map(async (friendId) => {
              const friendDoc = await getDoc(doc(db, "users", friendId));
              if (friendDoc.exists()) {
                return { id: friendId, ...friendDoc.data() };
              }
              return null;
            });
            
            Promise.all(friendPromises).then((friendsData) => {
              setFriends(friendsData.filter(Boolean));
            });
          } else {
            setFriends([]);
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [currentUser]);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", searchTerm),
        where("username", "<=", searchTerm + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
    setLoading(false);
  };
  
  const addFriend = async (friendId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      // Add friendId to current user's friends array
      await updateDoc(userRef, {
        friends: arrayUnion(friendId)
      });
      
      // Add current user to the other user's friends array
      const friendRef = doc(db, "users", friendId);
      await updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid)
      });
      
      // Clear search results
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };
  
  const removeFriend = async (friendId) => {
    try {
      // Remove friend from current user's friends array
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });
      
      // Remove current user from the other user's friends array
      const friendRef = doc(db, "users", friendId);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid)
      });
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };
  
  const blockUser = async (userId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      
      // Add to blocked list
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(userId),
        friends: arrayRemove(userId)
      });
      
      // Remove from friend's list
      const friendRef = doc(db, "users", userId);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid)
      });
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };
  
  return (
    <div className="friends-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="user-item">
              <div className="user-info">
                <div className="avatar">👤</div>
                <div className="username">{user.username}</div>
              </div>
              <button 
                className="add-friend-btn"
                onClick={() => addFriend(user.id)}
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="friends-list">
        <h3>Friends</h3>
        {friends.length === 0 ? (
          <p className="no-friends">You don't have any friends yet. Search for users to add them as friends!</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <div className="avatar">👤</div>
                <div className="username">{friend.username}</div>
              </div>
              <div className="friend-actions">
                <button 
                  className="chat-btn"
                  onClick={() => navigate(`/chat/${friend.id}`)}
                >
                  Chat
                </button>
                <button 
                  className="remove-friend-btn"
                  onClick={() => removeFriend(friend.id)}
                >
                  Unadd
                </button>
                <button 
                  className="block-btn"
                  onClick={() => blockUser(friend.id)}
                >
                  Block
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Chat Component
function Chat({ match }) {
  const { currentUser } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const friendId = match.params.id;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friendData, setFriendData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Get chat ID (combination of both user IDs in alphabetical order)
  const getChatId = () => {
    return [currentUser.uid, friendId].sort().join('_');
  };
  
  // Get friend data
  useEffect(() => {
    const getFriendData = async () => {
      try {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
          setFriendData(friendDoc.data());
        } else {
          navigate('/chats');
        }
      } catch (error) {
        console.error("Error getting friend data:", error);
        navigate('/chats');
      }
    };
    
    if (friendId) {
      getFriendData();
    }
  }, [friendId, navigate]);
  
  // Listen for messages
  useEffect(() => {
    if (!friendId || !currentUser) return;
    
    const chatId = getChatId();
    const q = query(
      collection(db, "chats", chatId, "messages"),
      where("timestamp", ">", new Date(0))
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort messages by timestamp
      messagesData.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messagesData);
    });
    
    return () => unsubscribe();
  }, [friendId, currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Cancel image selection
  const cancelImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !friendId) return;
    
    try {
      const chatId = getChatId();
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      
      // Create chat document if it doesn't exist
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, friendId],
          lastMessage: newMessage || "Image",
          lastUpdated: serverTimestamp()
        });
      } else {
        await updateDoc(chatRef, {
          lastMessage: newMessage || "Image",
          lastUpdated: serverTimestamp()
        });
      }
      
      // Message data
      const messageData = {
        senderId: currentUser.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false,
        deleted: false
      };
      
      // Upload image if selected
      if (imageFile) {
        const imageRef = ref(storage, `chats/${chatId}/${Date.now()}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);
        messageData.imageUrl = imageUrl;
      }
      
      // Add message to chat
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
      
      // Clear input
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!messages.length || !friendId) return;
      
      const chatId = getChatId();
      const unreadMessages = messages.filter(msg => 
        msg.senderId === friendId && !msg.read
      );
      
      // Update each unread message
      for (const msg of unreadMessages) {
        await updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
          read: true
        });
      }
    };
    
    markMessagesAsRead();
  }, [messages, friendId, currentUser]);
  
  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const chatId = getChatId();
      await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
        deleted: true,
        text: "This message was deleted"
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          ←
        </button>
        {friendData && (
          <div className="friend-details">
            <div className="avatar">👤</div>
            <div className="username">{friendData.username}</div>
          </div>
        )}
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
          >
            {message.imageUrl && !message.deleted && (
              <img 
                src={message.imageUrl} 
                alt="Shared image" 
                className="message-image" 
              />
            )}
            
            {(message.text || message.deleted) && (
              <div className="message-text">
                {message.deleted ? "This message was deleted" : message.text}
              </div>
            )}
            
            <div className="message-footer">
              <span className="message-status">
                {message.senderId === currentUser.uid && (
                  message.read ? "Read" : "Delivered"
                )}
              </span>
              
              {message.senderId === currentUser.uid && !message.deleted && (
                <button 
                  className="delete-btn"
                  onClick={() => deleteMessage(message.id)}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button className="cancel-image-btn" onClick={cancelImage}>
            Cancel
          </button>
        </div>
      )}
      
      <div className="message-input-container">
        <label className="image-upload-btn">
          📷
          <input 
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </label>
        
        <input
          type="text"
          placeholder="Send a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        
        <button className="send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

// Chats List Component
function ChatsList() {
  const [chats, setChats] = useState([]);
  const { currentUser } = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Query for chats where the current user is a participant
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData = [];
      
      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        
        // Get the other participant's ID
        const otherUserId = chatData.participants.find(
          id => id !== currentUser.uid
        );
        
        // Get other user's data
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        if (otherUserDoc.exists()) {
          const otherUserData = otherUserDoc.data();
          
          // Get unread messages count
          const messagesQuery = query(
            collection(db, "chats", doc.id, "messages"),
            where("senderId", "==", otherUserId),
            where("read", "==", false)
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          const unreadCount = messagesSnapshot.size;
          
          chatsData.push({
            id: doc.id,
            otherUser: {
              id: otherUserId,
              username: otherUserData.username
            },
            lastMessage: chatData.lastMessage,
            lastUpdated: chatData.lastUpdated,
            unreadCount
          });
        }
      }
      
      // Sort chats by last updated timestamp
      chatsData.sort((a, b) => {
        if (!a.lastUpdated || !b.lastUpdated) return 0;
        return b.lastUpdated.seconds - a.lastUpdated.seconds;
      });
      
      setChats(chatsData);
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  return (
    <div className="chats-container">
      <div className="chats-header">
        <h2>Chats</h2>
        <button className="new-chat-btn" onClick={() => navigate('/friends')}>
          New Chat
        </button>
      </div>
      
      <div className="chats-list">
        {chats.length === 0 ? (
          <p className="no-chats">No chats yet. Add friends to start chatting!</p>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id} 
              className="chat-item"
              onClick={() => navigate(`/chat/${chat.otherUser.id}`)}
            >
              <div className="chat-avatar">👤</div>
              <div className="chat-details">
                <div className="chat-header">
                  <span className="chat-username">{chat.otherUser.username}</span>
                  {chat.lastUpdated && (
                    <span className="chat-time">
                      {new Date(chat.lastUpdated.seconds * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                <div className="chat-preview">
                  <span className="last-message">
                    {chat.lastMessage || "Start chatting!"}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="unread-count">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Profile Component
function Profile() {
  const { currentUser } = React.useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.displayName || '');
    }
  }, [currentUser]);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const updateProfile = async () => {
    if (!username.trim() || !currentUser) return;
    
    setUpdating(true);
    setError('');
    
    try {
      // Update auth profile
      await updateProfile(currentUser, {
        displayName: username
      });
      
      // Update Firestore document
      await updateDoc(doc(db, "users", currentUser.uid), {
        username: username
      });
      
      alert("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile: " + error.message);
    }
    
    setUpdating(false);
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
      </div>
      
      <div className="profile-content">
        <div className="avatar-container">
          <div className="profile-avatar">👤</div>
          <p>Bitmoji coming soon</p>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="profile-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <button 
            className="update-profile-btn"
            onClick={updateProfile}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Profile"}
          </button>
        </div>
        
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Camera Component (placeholder)
function Camera() {
  return (
    <div className="camera-container">
      <h2>Camera</h2>
      <p>Camera functionality would be implemented here using WebRTC.</p>
      <div className="camera-placeholder">
        <span>📷</span>
      </div>
      <p>Web browsers have limited access to native camera functions compared to mobile apps.</p>
    </div>
  );
}

// Stories Component (placeholder) 
function Stories() {
  return (
    <div className="stories-container">
      <h2>Stories</h2>
      <p>Stories functionality would be implemented here.</p>
      <div className="stories-placeholder">
        <span>📱</span>
      </div>
    </div>
  );
}

// Map Component (placeholder)
function Map() {
  return (
    <div className="map-container">
      <h2>Snap Map</h2>
      <p>Map functionality would be implemented here using Google Maps or Mapbox API.</p>
      <div className="map-placeholder">
        <span>🗺️</span>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <ChatsList />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/chats" 
              element={
                <PrivateRoute>
                  <ChatsList />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/chat/:id" 
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/camera" 
              element={
                <PrivateRoute>
                  <Camera />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/stories" 
              element={
                <PrivateRoute>
                  <Stories />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/map" 
              element={
                <PrivateRoute>
                  <Map />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/friends" 
              element={
                <PrivateRoute>
                  <Friends />
                  <Navigation />
                </PrivateRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
