// public/spotify.js

// Helper: Get query parameters from the URL
function getQueryParams() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    params[key] = value;
  });
  return params;
}

const params = getQueryParams();
const sessionId = params.session;
if (!sessionId) {
  document.body.innerHTML = '<p>No session specified in the URL.</p>';
} else {
  // Ask user for their display name (or retrieve from localStorage)
  let displayName = localStorage.getItem("displayName");
  if (!displayName) {
    displayName = prompt("Enter your display name:");
    localStorage.setItem("displayName", displayName);
  }

  // Post participant info to the backend Cloud Function
  fetch(`https://<YOUR_BACKEND_DOMAIN>/api/session/${sessionId}/participant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ participant: displayName })
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log("Participant added");
    } else {
      console.error("Error adding participant", result.error);
    }
  })
  .catch(err => console.error("Error:", err));

  // Listen for realtime updates in the session via Firestore
  const sessionDocRef = db.collection("sessions").doc(sessionId);
  sessionDocRef.onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      // Update participants list
      const participantList = document.getElementById("participant-list");
      participantList.innerHTML = "";
      if (data.participants) {
        data.participants.forEach(p => {
          const li = document.createElement("li");
          li.textContent = p;
          participantList.appendChild(li);
        });
      }
      // (Optional) Update track info if stored in Firestore
      if (data.track) {
        document.getElementById("track-info").innerHTML = `
          <p><strong>${data.track.name}</strong> by ${data.track.artists.join(", ")}</p>
          <img src="${data.track.albumImage}" alt="Album Art" style="max-width:200px;">
        `;
      }
    }
  });

  // Fetch the current Spotify track from your backend (if the user is logged in)
  fetch("https://<YOUR_BACKEND_DOMAIN>/api/spotify/current")
    .then(res => {
      if (!res.ok) throw new Error("Not logged in");
      return res.json();
    })
    .then(data => {
      if (data && data.item) {
        const trackInfoDiv = document.getElementById("track-info");
        trackInfoDiv.innerHTML = `
          <p><strong>${data.item.name}</strong> by ${data.item.artists.map(a => a.name).join(", ")}</p>
          <img src="${data.item.album.images[0].url}" alt="Album Art" style="max-width:200px;">
        `;
      }
    })
    .catch(err => {
      document.getElementById("track-info").innerHTML =
        "<p>Please log in with Spotify to see your current track.</p>";
    });

  // (Optional) Poll the current track every 10 seconds
  setInterval(() => {
    fetch("https://<YOUR_BACKEND_DOMAIN>/api/spotify/current")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(data => {
        if (data && data.item) {
          const trackInfoDiv = document.getElementById("track-info");
          trackInfoDiv.innerHTML = `
            <p><strong>${data.item.name}</strong> by ${data.item.artists.map(a => a.name).join(", ")}</p>
            <img src="${data.item.album.images[0].url}" alt="Album Art" style="max-width:200px;">
          `;
        }
      })
      .catch(() => {});
  }, 10000);
}
