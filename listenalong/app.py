/* Global container styling */
.app-container {
  background-color: #1a1a1a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Card container to hold the interactive UI */
.card {
  background-color: #2c2c2c;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  text-align: center;
  width: 320px;
}

/* Heading styling */
.card h1 {
  color: #ffffff;
  margin-bottom: 1.5rem;
}

/* Dropdown menu styling with a round (pill-shaped) design */
.dropdown {
  background-color: #2c2c2c;
  color: #ffffff;
  border: 2px solid #00ff00;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  width: 100%;
  appearance: none;
  outline: none;
  transition: border 0.3s ease;
  margin-bottom: 1.5rem;
}

.dropdown:focus {
  border-color: #66ff66;
}

/* Result area styling */
.result {
  background-color: #3a3a3a;
  padding: 1rem;
  border-radius: 15px;
  color: #ffffff;
  text-align: left;
}

.result p {
  margin: 0.5rem 0;
}
