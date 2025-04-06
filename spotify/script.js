function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  const url = window.location.href;
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const room = getParameterByName("room");

function loadRoom() {
  fetch(`/api/room/${room}`)
    .then(response => response.json())
    .then(data => {
      if (data.embed_url) {
        document.getElementById("player").src = data.embed_url;
        document.getElementById("track-title").textContent = data.track_link;
      }
    });
}

function loadParticipants() {
  fetch(`/api/participants/${room}`)
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById("participant-list");
      list.innerHTML = "";
      data.forEach(p => {
        list.innerHTML += `<li><img src="${p.avatar}" alt="${p.name}" width="30" height="30"> ${p.name}</li>`;
      });
    });
}

document.getElementById("join-btn").addEventListener("click", () => {
  const name = document.getElementById("username").value || "Anonymous";
  const avatar = document.getElementById("avatar").value || "https://via.placeholder.com/30";
  fetch("/api/participant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, name, avatar })
  }).then(() => {
    loadParticipants();
  });
});

loadRoom();
loadParticipants();
setInterval(loadParticipants, 5000);
