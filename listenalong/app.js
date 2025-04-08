import React, { useState } from 'react';
import './App.css';

// Sample data based on your JSON snippet
const data = {
  specialMixes: [
    {
      name: "Coca Super Mix",
      product: "Cocaine",
      substances: ["Cuke", "Paracetamol", "Banana", "Gasoline", "Cuke", "Mega Bean", "Battery", "Banana"],
      effects: ["Jennerising", "Tropic Thunder", "Anti-Gravity", "Zombifying", "Glowing", "Foggy", "Bright-Eyed", "Gingeritis"],
      cost: 31,
      sellPrice: 666
    },
    {
      name: "Base 1 substance recipe of Coca",
      product: "Cocaine",
      substances: ["Indica"],
      effects: ["Jennerising"],
      Addictiveness: 74,
      cost: 8,
      sellPrice: 213
    },
    {
      name: "Base 1 substance recipe of Sour Diesel",
      product: "Sour Diesel",
      substances: ["Horse Semen"],
      effects: ["Energizing", "Long-Faced"],
      Addictiveness: 99,
      cost: 9,
      sellPrice: 58
    },
    {
      name: "Coca Super Mix 2",
      product: "Cocaine",
      substances: ["Motor Oil", "Cuke", "Paracetamol", "Gasoline", "Cuke", "Battery", "Horse Semen", "mega bean"],
      effects: ["Anti-Gravity", "Glowing", "Tropic Thunder", "Zombifying", "Cyclopean", "Bright-Eyed", "Long Faced", "Foggy"],
      cost: 42,
      sellPrice: 735
    },
    {
      name: "One of best Meth Mix Recipe",
      product: "Meth",
      substances: ["Banana", "Cuke", "Paracetamol", "Gasoline", "Cuke", "Battery", "Horse Semen", "mega bean"],
      effects: ["Electrifying", "Glowing", "Tropic Thunder", "Zombifying", "Cyclopean", "Bright-Eyed", "Long Faced", "Foggy"],
      cost: 38,
      sellPrice: 340
    },
    {
      name: "OG Mix 140 Revenue",
      product: "Cocaine",
      substances: ["Banana", "Gasoline", "Paracetamol", "Cuke", "Mega Bean", "Battery", "Banana", "Cuke"],
      effects: ["Tropic Thunder", "Anti-Gravity", "Zombifying", "Jennerising", "Glowing", "Cyclopean", "Bright-Eyed", "Thought-Provoking"],
      cost: 31,
      sellPrice: 171
    },
    {
      name: "beginner-friendly for OG Kush",
      product: "OG Kush",
      substances: ["Banana"],
      effects: ["Sneaky", "Gingeritis"],
      cost: 2,
      sellPrice: 50
    },
    {
      name: "beginner-friendly for Sour Diesel",
      product: "Sour Diesel",
      substances: ["Battery"],
      effects: ["Refreshing", "Bright-Eyed"],
      cost: 8,
      sellPrice: 53
    },
    {
      name: "beginner-friendly for Green Crack",
      product: "Green Crack",
      substances: ["Chili"],
      effects: ["Energizing", "Spicy"],
      cost: 7,
      sellPrice: 56
    },
    {
      name: "beginner-friendly for Grandaddy Purple",
      product: "Grandaddy Purple",
      substances: ["Horse Semen"],
      effects: ["Sedating", " Long-Faced"],
      cost: 9,
      sellPrice: 62
    }
  ]
};

function App() {
  const [selectedMix, setSelectedMix] = useState(null);

  const handleSelect = (e) => {
    const selectedName = e.target.value;
    const mix = data.specialMixes.find(m => m.name === selectedName);
    setSelectedMix(mix);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Special Mix Calculator</h1>
        <select className="dropdown" onChange={handleSelect} defaultValue="">
          <option value="" disabled>
            Select a Special Mix...
          </option>
          {data.specialMixes.map((mix) => (
            <option key={mix.name} value={mix.name}>
              {mix.name}
            </option>
          ))}
        </select>

        {selectedMix && (
          <div className="result">
            <p><strong>Product:</strong> {selectedMix.product}</p>
            <p><strong>Cost:</strong> ${selectedMix.cost}</p>
            <p><strong>Sell Price:</strong> ${selectedMix.sellPrice}</p>
            <p>
              <strong>Profit:</strong> ${selectedMix.sellPrice - selectedMix.cost}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
