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
function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60);
  return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}
function updatePlayback() {
  if (!userId) return;
  fetch(`http://127.0.0.1:8888/current?user=${userId}`)
    .then(response => response.json())
    .then(data => {
       if (!data.error && data.item) {
         document.getElementById('track-title').textContent = data.item.name;
         document.getElementById('artist-name').textContent = data.item.artists.map(a => a.name).join(', ');
         document.getElementById('album-cover').src = data.item.album.images[0].url;
         const progress = data.progress_ms;
         const duration = data.item.duration_ms;
         document.getElementById('current-time').textContent = msToTime(progress);
         document.getElementById('duration').textContent = msToTime(duration);
         document.getElementById('progress').style.width = (progress / duration * 100) + '%';
       }
    });
}
setInterval(updatePlayback, 5000);
