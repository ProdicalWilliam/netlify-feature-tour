function initializeFireBase(){
	// Your web app's Firebase configuration
	var firebaseConfig = {
	apiKey: "AIzaSyDTATBOCPb_uGYt5Trmx1EZu7doCR0WWvw",
  authDomain: "spotify-795ab.firebaseapp.com",
  databaseURL: "https://spotify-795ab-default-rtdb.firebaseio.com",
  projectId: "spotify-795ab",
  storageBucket: "spotify-795ab.firebasestorage.app",
  messagingSenderId: "907464366407",
  appId: "1:907464366407:web:e8915a98e9a3719bdb1462",
  measurementId: "G-TT6RD9XYR6"
};

function initializeFireBaseDev(){
	// Your web app's Firebase configuration
	var firebaseConfig = {
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
	firebase.initializeApp(firebaseConfig);
}
