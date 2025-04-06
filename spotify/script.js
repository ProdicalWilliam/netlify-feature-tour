function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const url = window.location.href;
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
const userId = getParameterByName('user');
function updateTrack() {
  if (!userId) return;
  fetch(`http://127.0.0.1:8888/track/${userId}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        document.getElementById('track-title').textContent = data.title;
        document.getElementById('artist-name').textContent = data.artist;
        document.getElementById('album-cover').src = data.album_cover;
        document.getElementById('player').src = data.video_url;
      }
    });
}
setInterval(updateTrack, 5000);
