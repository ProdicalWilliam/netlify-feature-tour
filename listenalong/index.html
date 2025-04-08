<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spotify ListenAlong</title>
  <link rel="icon" type="image/png" href="https://static.vecteezy.com/system/resources/previews/023/986/494/non_2x/spotify-logo-spotify-logo-transparent-spotify-icon-transparent-free-free-png.png">
  <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js"></script>
  <script async src="https://www.youtube.com/iframe_api"></script>
  <script src="https://sdk.scdn.co/spotify-player.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #121212, #2c003e); color: #fff; min-height: 100vh; }
    button { background: #1db954; color: white; border: none; padding: 10px 15px; border-radius: 30px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    button:hover { background: #1ed760; box-shadow: 0 0 10px rgba(29, 185, 84, 0.5); }
    input, select { background: rgba(40, 40, 40, 0.8); border: 1px solid rgba(29, 185, 84, 0.5); color: white; padding: 12px; border-radius: 30px; width: 100%; margin: 8px 0; outline: none; }
    input:focus, select:focus { border-color: #1db954; box-shadow: 0 0 5px rgba(29, 185, 84, 0.7); }
    .fade-in { animation: fadeIn 0.5s ease-in-out forwards; opacity: 0; }
    @keyframes fadeIn { to { opacity: 1; } }
    .section-title { font-size: 24px; font-weight: 700; margin: 20px 0; text-align: center; color: #1db954; text-shadow: 0 0 5px rgba(29, 185, 84, 0.5); }
    #auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; }
    .auth-form { background: rgba(18, 18, 18, 0.95); border-radius: 10px; padding: 30px; width: 320px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9); text-align: center; }
    .form-title { font-size: 28px; margin-bottom: 20px; color: #1db954; }
    .auth-toggle { margin-top: 15px; color: #aaa; font-size: 14px; }
    .auth-toggle span { color: #1db954; cursor: pointer; text-decoration: underline; }
    header { background: rgba(18, 18, 18, 0.95); padding: 15px 20px; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8); }
    header img { height: 40px; margin-right: 15px; }
    header h1 { margin: 0; font-size: 24px; color: #1db954; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0; }
    .room-card { background: rgba(30, 30, 30, 0.8); border-radius: 10px; padding: 15px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; flex-direction: column; border: 1px solid rgba(40, 40, 40, 0.8); }
    .room-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); border-color: rgba(29, 185, 84, 0.5); }
    .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .room-name { font-size: 18px; font-weight: 600; color: #fff; }
    .room-visibility { font-size: 20px; }
    .room-info { font-size: 14px; color: #aaa; flex-grow: 1; }
    .room-footer { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }
    .room-participants { display: flex; align-items: center; font-size: 14px; color: #aaa; }
    .participants-icon { margin-right: 5px; }
    .create-room-btn { margin: 20px auto; display: block; padding: 12px 25px; font-size: 16px; }
    #chat-room { display: none; }
    .room-title { font-size: 24px; font-weight: 600; }
    .media-player { background: rgba(30, 30, 30, 0.8); border-radius: 10px; padding: 20px; margin-bottom: 20px; position: relative; }
    .media-controls { margin-top: 15px; }
    .media-controls input[type="range"] { width: 100%; margin: 10px 0; height: 6px; border-radius: 3px; -webkit-appearance: none; background: rgba(60, 60, 60, 0.8); }
    .media-controls input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #1db954; cursor: pointer; }
    .time-display { display: flex; justify-content: space-between; font-size: 14px; color: #aaa; }
    .chat-container { background: rgba(30, 30, 30, 0.8); border-radius: 10px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; height: 300px; }
    .chat-messages { flex-grow: 1; overflow-y: auto; margin-bottom: 15px; padding-right: 10px; }
    .message { padding: 8px 0; border-bottom: 1px solid rgba(60, 60, 60, 0.8); }
    .message-user { font-weight: 600; color: #1db954; }
    .message-text { color: #fff; }
    .chat-input { display: flex; gap: 10px; }
    .chat-input input { flex-grow: 1; }
    .participants-container { background: rgba(30, 30, 30, 0.8); border-radius: 10px; padding: 20px; }
    .participants-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .participant { display: flex; align-items: center; background: rgba(40, 40, 40, 0.8); border-radius: 30px; padding: 5px 10px; }
    .participant-avatar { width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; object-fit: cover; }
    .participant-creator { border: 1px solid #1db954; }
    .participant-controls { margin-left: 8px; display: flex; gap: 5px; }
    .participant-controls button { padding: 2px 8px; font-size: 12px; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: rgba(30, 30, 30, 0.95); border-radius: 10px; padding: 25px; width: 350px; box-shadow: 0 0 20px rgba(29, 185, 84, 0.5); }
    footer { text-align: center; padding: 15px; font-size: 14px; color: #aaa; margin-top: 40px; }
    #ytplayer.invisible-player { width: 0; height: 0; overflow: hidden; }
    #audioContainer audio { width: 100%; border-radius: 30px; outline: none; }
    .custom-controls { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 10px; }
  </style>
</head>
<body>
  <div id="auth-container" class="fade-in">
    <div class="auth-form" id="login-form">
      <div class="form-title">Spotify ListenAlong</div>
      <input type="email" id="login-email" placeholder="Email">
      <input type="password" id="login-password" placeholder="Password">
      <button onclick="login()">Login</button>
      <div class="auth-toggle">Don't have an account? <span onclick="showRegisterForm()">Register</span></div>
    </div>
    <div class="auth-form" id="register-form" style="display: none;">
      <div class="form-title">Create Account</div>
      <input type="email" id="register-email" placeholder="Email">
      <input type="password" id="register-password" placeholder="Password">
      <input type="text" id="register-username" placeholder="Username">
      <input type="text" id="register-avatar" placeholder="Avatar URL (optional)">
      <button onclick="register()">Create Account</button>
      <div class="auth-toggle">Already have an account? <span onclick="showLoginForm()">Login</span></div>
    </div>
  </div>
  <div id="app-container" style="display: none;">
    <header>
      <img src="https://static.vecteezy.com/system/resources/previews/023/986/494/non_2x/spotify-logo-spotify-logo-transparent-spotify-icon-transparent-free-free-png.png" alt="Spotify Icon">
      <h1>Spotify ListenAlong</h1>
    </header>
    <div class="container">
      <div id="server-browser" class="fade-in">
        <div class="section-title">Available Rooms</div>
        <div id="rooms-list" class="rooms-grid"></div>
        <button class="create-room-btn" onclick="showCreateRoomModal()">Create New Room</button>
      </div>
      <div id="chat-room" class="fade-in">
        <div class="room-header">
          <h2 id="room-title" class="room-title">Room</h2>
          <div>
            <button id="leave-room-btn" onclick="leaveRoom()">Leave Room</button>
            <button id="close-room-btn" style="display: none;" onclick="closeRoom()">Close Room</button>
          </div>
        </div>
        <div class="media-player">
          <input type="text" id="media-url" placeholder="Enter media URL">
          <button onclick="updateMedia()">Play Media</button>
          <div id="player-container">
            <div id="ytplayer" class="invisible-player"></div>
            <div id="audioContainer"></div>
            <div id="spotifyContainer"></div>
            <div id="soundcloudContainer"></div>
          </div>
          <div class="custom-controls" id="custom-controls" style="display:none;">
            <button onclick="customPlay()">Play</button>
            <button onclick="customPause()">Pause</button>
            <button onclick="customSkip()">Skip</button>
          </div>
          <div class="media-controls" id="media-controls">
            <input type="range" id="seek-slider" min="0" max="100" value="0">
            <div class="time-display">
              <span id="current-time">0:00</span>
              <span id="duration">0:00</span>
            </div>
          </div>
        </div>
        <div class="chat-container">
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-input">
            <input type="text" id="chat-message" placeholder="Type a message" onkeypress="if(event.key === 'Enter') sendMessage()">
            <button onclick="sendMessage()">Send</button>
          </div>
        </div>
        <div class="participants-container">
          <div class="section-title">Participants</div>
          <div id="participants-list" class="participants-list"></div>
        </div>
      </div>
    </div>
    <footer>ListenAlong 2025</footer>
  </div>
  <div id="password-modal" class="modal-overlay">
    <div class="modal-content">
      <div class="section-title">Enter Room Password</div>
      <input type="password" id="room-password" placeholder="Password">
      <button onclick="joinPrivateRoom()">Join Room</button>
    </div>
  </div>
  <div id="create-room-modal" class="modal-overlay">
    <div class="modal-content">
      <div class="section-title">Create Room</div>
      <input type="text" id="new-room-name" placeholder="Room Name">
      <input type="password" id="new-room-password" placeholder="Room Password (optional)">
      <select id="new-room-visibility">
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button onclick="hideModal('create-room-modal')" style="flex: 1; background: #444;">Cancel</button>
        <button onclick="createRoom()" style="flex: 1;">Create</button>
      </div>
    </div>
  </div>
  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyDTATBOCPb_uGYt5Trmx1EZu7doCR0WWvw",
      authDomain: "spotify-795ab.firebaseapp.com",
      projectId: "spotify-795ab",
      storageBucket: "spotify-795ab.appspot.com",
      messagingSenderId: "907464366407",
      appId: "1:907464366407:web:1c736b0a36c792ffdb1462"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    const adminUID = "1119TCpma1ajWOeI250vQ2Un1dg2";
    let currentRoomId = null, youtubePlayer = null, mediaType = null, roomCreatorUID = null, currentUserProfile = { username:"",avatar:"" },
        updateInterval = null, pendingRoom = null, audioPlayer = null, spotifyPlayer = null;
    let currentMediaType = null, isMaster = false;
    const mediaContainerID = { mp3: 'audioContainer', spotify:'spotifyContainer', soundcloud:'soundcloudContainer' };
    function showLoginForm(){document.getElementById('register-form').style.display='none';document.getElementById('login-form').style.display='block';}
    function showRegisterForm(){document.getElementById('login-form').style.display='none';document.getElementById('register-form').style.display='block';}
    function login(){const email=document.getElementById('login-email').value, pass=document.getElementById('login-password').value; if(!email||!pass)return alert("Please enter email and password"); auth.signInWithEmailAndPassword(email,pass).then(u=>loadUserProfile(u.user)).catch(e=>alert("Login failed: "+e.message));}
    function register(){const email=document.getElementById('register-email').value, pass=document.getElementById('register-password').value, username=document.getElementById('register-username').value||("User"+Math.floor(Math.random()*10000)), avatar=document.getElementById('register-avatar').value||"https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-and-shapes-3/177800/129-512.png"; if(!email||!pass)return alert("Please enter email and password"); auth.createUserWithEmailAndPassword(email,pass).then(u=>{db.ref('users/'+u.user.uid).set({username,avatar}); loadUserProfile(u.user)}).catch(e=>alert("Registration failed: "+e.message));}
    function loadUserProfile(user){db.ref('users/'+user.uid).once('value').then(snap=>{const d=snap.val()||{}; currentUserProfile.username=d.username||("User"+Math.floor(Math.random()*10000)); currentUserProfile.avatar=d.avatar||"https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-and-shapes-3/177800/129-512.png"; document.getElementById('auth-container').style.display='none'; document.getElementById('app-container').style.display='block'; loadRooms();});}
    function loadRooms(){const rList=document.getElementById('rooms-list'); rList.innerHTML=''; db.ref('rooms').on('child_added', snap=>{const room=snap.val(), roomId=snap.key, card=document.createElement('div'); card.className='room-card fade-in'; const vis=room.visibility==='private'?'🔒':'🔓', pCount=room.participants?Object.keys(room.participants).length:0; card.innerHTML=`<div class="room-header"><div class="room-name">${room.name}</div><div class="room-visibility">${vis}</div></div><div class="room-info">Created by ${room.creatorName||'Unknown'}</div><div class="room-footer"><div class="room-participants"><span class="participants-icon">👥</span>${pCount} ${pCount===1?'listener':'listeners'}</div><span style="color: #1db954; font-size: 12px;">Click to join</span></div>`; card.addEventListener('click', ()=>{ if(room.password){ pendingRoom={id:roomId,room}; showModal('password-modal'); } else joinRoom(roomId); }); rList.appendChild(card);}); db.ref('rooms').on('child_removed', ()=>loadRooms());}
    function showCreateRoomModal(){showModal('create-room-modal');}
    function createRoom(){const name=document.getElementById('new-room-name').value, password=document.getElementById('new-room-password').value, visibility=document.getElementById('new-room-visibility').value; if(!name)return alert('Please enter a room name'); const user=auth.currentUser, roomData={ name, password: password||null, visibility, mediaLink:"", mediaTimestamp:0, creator:user.uid, creatorName: currentUserProfile.username, createdAt: firebase.database.ServerValue.TIMESTAMP }; db.ref('rooms').push().set(roomData).then(ref=>{hideModal('create-room-modal'); joinRoom(ref.key);}).catch(e=>alert('Error creating room: '+e.message));}
    function joinRoom(roomId){ db.ref(`rooms/${roomId}/banned/${auth.currentUser.uid}`).once('value').then(snap=>{ if(snap.val())return alert('You have been banned from this room.'); document.getElementById('server-browser').style.display='none'; document.getElementById('chat-room').style.display='block'; currentRoomId=roomId; db.ref(`rooms/${roomId}`).once('value').then(snap=>{ const room=snap.val(); roomCreatorUID=room.creator; document.getElementById('room-title').innerText=room.name; if(auth.currentUser.uid===roomCreatorUID||auth.currentUser.uid===adminUID){ document.getElementById('close-room-btn').style.display='inline-block'; document.getElementById('custom-controls').style.display='flex'; } else { document.getElementById('custom-controls').style.display='none'; } }); const uid=auth.currentUser.uid; db.ref(`rooms/${roomId}/participants/${uid}`).set({ username: currentUserProfile.username, avatar: currentUserProfile.avatar }); db.ref(`rooms/${roomId}/participants/${uid}`).onDisconnect().remove(); db.ref(`rooms/${roomId}/mediaLink`).on('value', snap=>{ const link=snap.val(); if(link){ mediaType=detectMediaType(link); loadMedia(link); } }); db.ref(`rooms/${roomId}/mediaTimestamp`).on('value', snap=>{ const ts=snap.val(); syncMedia(ts); }); db.ref(`rooms/${roomId}/chat`).on('child_added', snap=>displayMessage(snap.val())); db.ref(`rooms/${roomId}/participants`).on('value', snap=>updateParticipantsList(snap.val())); });}
    function joinPrivateRoom(){ const password=document.getElementById('room-password').value; if(pendingRoom && pendingRoom.room.password===password){ hideModal('password-modal'); document.getElementById('room-password').value=''; joinRoom(pendingRoom.id); pendingRoom=null; } else alert('Incorrect password!'); }
    function leaveRoom(){ if(!currentRoomId)return; db.ref(`rooms/${currentRoomId}/mediaLink`).off(); db.ref(`rooms/${currentRoomId}/mediaTimestamp`).off(); db.ref(`rooms/${currentRoomId}/chat`).off(); db.ref(`rooms/${currentRoomId}/participants`).off(); db.ref(`rooms/${currentRoomId}/participants/${auth.currentUser.uid}`).remove(); stopMedia(); document.getElementById('chat-messages').innerHTML=''; currentRoomId=null; roomCreatorUID=null; document.getElementById('server-browser').style.display='block'; document.getElementById('chat-room').style.display='none'; document.getElementById('close-room-btn').style.display='none'; }
    function closeRoom(){ if(!currentRoomId || (auth.currentUser.uid!==roomCreatorUID && auth.currentUser.uid!==adminUID))return; if(confirm('Are you sure you want to close this room?')) db.ref(`rooms/${currentRoomId}`).remove().then(()=>leaveRoom()).catch(e=>alert('Error closing room: '+e.message)); }
    function detectMediaType(link){ if(!link)return null; if(link.match(/\.(mp3|wav|ogg|flac|aac|m4a)(\?.*)?$/i)) return 'mp3'; else if(link.includes('youtube.com') || link.includes('youtu.be')) return 'youtube'; else if(link.includes('open.spotify.com')) return 'spotify'; else if(link.includes('soundcloud.com')) return 'soundcloud'; return 'unknown'; }
    function updateMedia(){ if(!currentRoomId)return; if(auth.currentUser.uid!==roomCreatorUID && auth.currentUser.uid!==adminUID)return alert('Only the room creator or admin can update media'); const mediaUrl=document.getElementById('media-url').value; if(!mediaUrl)return alert('Please enter a media URL'); db.ref(`rooms/${currentRoomId}`).update({ mediaLink:mediaUrl, mediaTimestamp:0 }); document.getElementById('media-url').value=''; }
    function loadMedia(link){ if(!link)return; stopMedia(); document.getElementById('ytplayer').innerHTML=''; document.getElementById('audioContainer').innerHTML=''; document.getElementById('spotifyContainer').innerHTML=''; document.getElementById('soundcloudContainer').innerHTML=''; if(mediaType==='mp3'){ loadAudioFile(link); } else if(mediaType==='youtube'){ loadYoutubeFallback(link); } else if(mediaType==='spotify'){ loadSpotifyTrack(link); } else if(mediaType==='soundcloud'){ loadSoundCloudTrack(link); } }
    function loadAudioFile(link){ const container=document.getElementById('audioContainer'); audioPlayer=document.createElement('audio'); audioPlayer.src=link; audioPlayer.controls=true; audioPlayer.onloadedmetadata=()=>{ document.getElementById('duration').innerText=formatTime(audioPlayer.duration); }; audioPlayer.ontimeupdate=()=>{ document.getElementById('current-time').innerText=formatTime(audioPlayer.currentTime); document.getElementById('seek-slider').value=(audioPlayer.currentTime/audioPlayer.duration)*100; if(isMaster && !audioPlayer.paused) broadcastTime(); }; container.appendChild(audioPlayer); audioPlayer.play(); setupSyncListeners(); }
    function loadYoutubeFallback(link){ const videoId=extractYoutubeId(link); const dmPlayer=document.createElement('div'); dmPlayer.id='dm-player'; document.getElementById('ytplayer').appendChild(dmPlayer); const msg=document.createElement('div'); msg.style.padding='10px'; msg.style.marginTop='10px'; msg.style.backgroundColor='rgba(30,30,30,0.8)'; msg.style.borderRadius='5px'; msg.innerHTML=`<p>YouTube direct playback is unavailable. Video ID: ${videoId}</p>`; document.getElementById('ytplayer').appendChild(msg); const searchLink=document.createElement('a'); searchLink.href=`https://www.dailymotion.com/search/${videoId}`; searchLink.target='_blank'; searchLink.textContent='Search on DailyMotion'; searchLink.style.color='#1db954'; searchLink.style.display='block'; searchLink.style.marginTop='10px'; document.getElementById('ytplayer').appendChild(searchLink); document.getElementById('ytplayer').classList.remove('invisible-player'); }
    function loadSpotifyTrack(link){ const trackId=link.split('/').pop().split('?')[0]; const iframe=document.createElement('iframe'); iframe.src=`https://open.spotify.com/embed/track/${trackId}`; iframe.width='100%'; iframe.height='80'; iframe.frameBorder='0'; iframe.allowtransparency='true'; iframe.allow='encrypted-media'; document.getElementById('spotifyContainer').appendChild(iframe); if(auth.currentUser.uid===roomCreatorUID || auth.currentUser.uid===adminUID){ initSpotifyPlayer(trackId); } }
    function initSpotifyPlayer(trackId){ window.onSpotifyWebPlaybackSDKReady = () => { spotifyPlayer = new Spotify.Player({ name: 'ListenAlong Player', getOAuthToken: cb=>{ cb('YOUR_SPOTIFY_OAUTH_TOKEN'); } }); spotifyPlayer.connect(); }; }
    function loadSoundCloudTrack(link){ const iframe=document.createElement('iframe'); iframe.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&color=%231db954&auto_play=true`; iframe.width='100%'; iframe.height='166'; iframe.frameBorder='0'; iframe.allow='autoplay'; document.getElementById('soundcloudContainer').appendChild(iframe); }
    function extractYoutubeId(url){ const regex=/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/; const match=url.match(regex); return match?match[1]:''; }
    function stopMedia(){ if(youtubePlayer&&youtubePlayer.stopVideo) youtubePlayer.stopVideo(); if(audioPlayer){ audioPlayer.pause(); audioPlayer.currentTime=0; } if(updateInterval){ clearInterval(updateInterval); updateInterval=null; } }
    function syncMedia(timestamp){ if(!timestamp || typeof timestamp!=='number')return; if(mediaType==='mp3' && audioPlayer) audioPlayer.currentTime=timestamp; else if(mediaType==='youtube'&&youtubePlayer&&youtubePlayer.seekTo) youtubePlayer.seekTo(timestamp,true); }
    function formatTime(sec){ const m=Math.floor(sec/60), s=Math.floor(sec%60); return `${m}:${s<10?'0':''}${s}`; }
    function sendMessage(){ if(!currentRoomId)return; const inp=document.getElementById('chat-message'), msg=inp.value.trim(); if(!msg)return; db.ref(`rooms/${currentRoomId}/chat`).push({ user: currentUserProfile.username, avatar: currentUserProfile.avatar, text: msg, timestamp: firebase.database.ServerValue.TIMESTAMP }); inp.value=''; }
    function displayMessage(message){ const chat=document.getElementById('chat-messages'), div=document.createElement('div'); div.className='message fade-in'; const ts=new Date(message.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); div.innerHTML=`<span class="message-time">[${ts}]</span><span class="message-user">${message.user}:</span><span class="message-text">${message.text}</span>`; chat.appendChild(div); chat.scrollTop=chat.scrollHeight; }
    function updateParticipantsList(participants){ const pList=document.getElementById('participants-list'); pList.innerHTML=''; if(!participants){ pList.innerHTML='<div style="text-align: center; width: 100%; padding: 10px; color: #aaa;">No participants</div>'; return; } Object.keys(participants).forEach(uid=>{ const part=participants[uid], div=document.createElement('div'); div.className=`participant ${uid===roomCreatorUID?'participant-creator':''}`; div.innerHTML=`<img class="participant-avatar" src="${part.avatar}" alt="${part.username}"><span>${part.username}</span>${uid===roomCreatorUID?'<span style="margin-left: 5px; color: #1db954;">👑</span>':''}`; if((auth.currentUser.uid===roomCreatorUID||auth.currentUser.uid===adminUID)&& uid!==auth.currentUser.uid && uid!==roomCreatorUID){ const ctrls=document.createElement('div'); ctrls.className='participant-controls'; const kick=document.createElement('button'); kick.innerText='Kick'; kick.addEventListener('click',()=>kickUser(uid)); const ban=document.createElement('button'); ban.innerText='Ban'; ban.addEventListener('click',()=>banUser(uid)); ctrls.appendChild(kick); ctrls.appendChild(ban); div.appendChild(ctrls); } pList.appendChild(div); }); }
    function kickUser(uid){ if(!currentRoomId||(auth.currentUser.uid!==roomCreatorUID&&auth.currentUser.uid!==adminUID))return; db.ref(`rooms/${currentRoomId}/participants/${uid}`).remove(); }
    function banUser(uid){ if(!currentRoomId||(auth.currentUser.uid!==roomCreatorUID&&auth.currentUser.uid!==adminUID))return; if(confirm('Are you sure you want to ban this user?')){ db.ref(`rooms/${currentRoomId}/banned/${uid}`).set(true); kickUser(uid); } }
    function showModal(id){ document.getElementById(id).style.display='flex'; }
    function hideModal(id){ document.getElementById(id).style.display='none'; }
    document.addEventListener('DOMContentLoaded', ()=>{ auth.onAuthStateChanged(u=>{ if(u) loadUserProfile(u); else { document.getElementById('auth-container').style.display='flex'; document.getElementById('app-container').style.display='none'; } }); document.getElementById('seek-slider').addEventListener('input', function(){ if(!currentRoomId)return; if(mediaType==='mp3'&&audioPlayer){ const t=(this.value/100)*audioPlayer.duration; audioPlayer.currentTime=t; if(auth.currentUser.uid===roomCreatorUID||auth.currentUser.uid===adminUID) db.ref(`rooms/${currentRoomId}`).update({mediaTimestamp:t}); } }); });
    function customPlay(){ if(mediaType==='spotify' && spotifyPlayer){ spotifyPlayer.resume().catch(e=>console.error(e)); } else if(mediaType==='mp3' && audioPlayer){ audioPlayer.play(); } }
    function customPause(){ if(mediaType==='spotify' && spotifyPlayer){ spotifyPlayer.pause().catch(e=>console.error(e)); } else if(mediaType==='mp3' && audioPlayer){ audioPlayer.pause(); broadcastPause(); } }
    function customSkip(){ if(mediaType==='spotify' && spotifyPlayer){ spotifyPlayer.nextTrack().catch(e=>console.error(e)); } }
    function broadcastTime(){ if(isMaster && mediaType==='mp3' && audioPlayer && !audioPlayer.paused){ const msg={type:'sync', time: audioPlayer.currentTime}; localStorage.setItem('audioSyncMessage',JSON.stringify(msg)); } }
    function broadcastPause(){ if(isMaster && mediaType==='mp3' && audioPlayer){ const msg={type:'pause'}; localStorage.setItem('audioSyncMessage',JSON.stringify(msg)); } }
    function handleSync(msg){ if(!isMaster && mediaType==='mp3'&&audioPlayer){ const newTime=parseFloat(msg.time); if(Math.abs(audioPlayer.currentTime-newTime)>0.5) audioPlayer.currentTime=newTime; if(audioPlayer.paused) audioPlayer.play().catch(e=>console.error(e)); } }
    function handlePause(){ if(!isMaster && mediaType==='mp3'&&audioPlayer&&!audioPlayer.paused){ audioPlayer.pause(); } }
    window.addEventListener('storage', event=>{ if(event.key==='audioSyncMessage'&&event.newValue){ try{ const msg=JSON.parse(event.newValue); if(msg.type==='sync') handleSync(msg); else if(msg.type==='pause') handlePause(); }catch(e){ console.error(e); } } });
    window.addEventListener('load', ()=>{ const init=localStorage.getItem('audioSyncMessage'); if(init&&mediaType==='mp3'&&audioPlayer){ try{ const msg=JSON.parse(init); if(msg.type==='sync') handleSync(msg); else if(msg.type==='pause') handlePause(); }catch(e){ console.error(e); } } else if(!init&&mediaType==='mp3'&&audioPlayer){ isMaster=true; } });
    setInterval(()=>{ const ls=localStorage.getItem('audioSyncMessage'); if(ls&&mediaType==='mp3'&&audioPlayer){ try{ const msg=JSON.parse(ls); if(msg.type==='sync') handleSync(msg); else if(msg.type==='pause' && !isMaster && !audioPlayer.paused) handlePause(); }catch(e){} } },500);
  </script>
</body>
</html>
