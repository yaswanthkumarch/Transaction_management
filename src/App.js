import React from 'react';
import './App.css';
import Summary from './components/Summary'; // Importing the Summary component

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Transaction Management</h1>
      <Summary /> {/* Include the Summary component here */}
    </div>
  );
}

export default App;
