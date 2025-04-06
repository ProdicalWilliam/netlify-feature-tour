// File: static/script.js
const roomCode = new URLSearchParams(window.location.search).get('room');
document.getElementById('roomCode').textContent = roomCode;

fetch(`/api/room/${roomCode}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('media-embed').src = data.embed_url;
        updateParticipants();
    })
    .catch(error => {
        console.error('Error loading room:', error);
        alert('Room not found or invalid');
    });

function updateParticipants() {
    fetch(`/api/participants/${roomCode}`)
        .then(response => response.json())
        .then(participants => {
            const participantsEl = document.getElementById('participants');
            participantsEl.innerHTML = '';
            
            if (participants.length === 0) {
                participantsEl.innerHTML = '<p>No listeners yet</p>';
                return;
            }
            
            participants.forEach(p => {
                const participant = document.createElement('div');
                participant.className = 'participant';
                
                const avatar = document.createElement('div');
                avatar.className = 'participant-avatar';
                
                const img = document.createElement('img');
                img.src = p.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                img.alt = p.name;
                avatar.appendChild(img);
                
                const name = document.createElement('div');
                name.className = 'participant-name';
                name.textContent = p.name;
                
                participant.appendChild(avatar);
                participant.appendChild(name);
                participantsEl.appendChild(participant);
            });
        });
}

document.getElementById('joinBtn').addEventListener('click', () => {
    const name = document.getElementById('nameInput').value || 'Anonymous';
    const avatar = document.getElementById('avatarInput').value || '';
    
    fetch('/api/participant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            room: roomCode,
            name: name,
            avatar: avatar
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('joinForm').style.display = 'none';
        updateParticipants();
        
        setInterval(updateParticipants, 5000);
    });
});
