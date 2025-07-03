import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Calculator from './Calculator';

const COLOR_PALETTE = [
  '#007bff', // Blue
  '#28a745', // Green
  '#dc3545', // Red
  '#ffc107', // Yellow
  '#6f42c1', // Purple
  '#fd7e14', // Orange
  '#20c997', // Teal
  '#6610f2', // Indigo
];

function App() {
  const [calculators, setCalculators] = useState([{ id: 1, color: COLOR_PALETTE[0] }]);
  const [nextId, setNextId] = useState(2);

  const addCalculator = () => {
    const newColorIndex = (nextId - 1) % COLOR_PALETTE.length;
    setCalculators([...calculators, { id: nextId, color: COLOR_PALETTE[newColorIndex] }]);
    setNextId(nextId + 1);
  };

  const removeCalculator = (idToRemove) => {
    setCalculators(calculators.filter(calc => calc.id !== idToRemove));
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">AWS C4E Kubernetes Instance Calculator</h1>
      <button className="btn btn-primary mb-4" onClick={addCalculator}>Add another calculation</button>
      {calculators.map((calc) => (
        <Calculator key={calc.id} onRemove={() => removeCalculator(calc.id)} podColor={calc.color} />
      ))}
    </div>
  );
}

export default App;
