import { useState } from 'react';
import './styles/AddShelterButton.css';

const AddShelterButton = ({ onClick }) => {
  return (
    <button
      className="add-shelter-btn"
      onClick={onClick}
      title="Suggest a new shelter"
    >
      ➕
    </button>
  );
};

export default AddShelterButton;