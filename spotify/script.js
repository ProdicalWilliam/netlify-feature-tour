function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const url = window.location.href;
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
const codeParam = getParameterByName('code');
if (codeParam) {
  document.getElementById('user-info').textContent = `Listening along as: ${codeParam}`;
} else {
  document.getElementById('user-info').textContent = "Static mode: No listen along code provided.";
}
