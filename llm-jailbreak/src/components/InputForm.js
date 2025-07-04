import MESSAGES from "./messages";
import React, { useState } from "react";

const InputForm = ({ onSubmitName, onSubmitGuess }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (input.trim() === "") {
      alert(MESSAGES.emptyInputError);
      return; // Prevent submission if input is empty
    }

    if (onSubmitName) {
      onSubmitName(input);
    } else if (onSubmitGuess) {
      onSubmitGuess(input);
    }
    setInput(""); // Clear input field after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={onSubmitName ? MESSAGES.enterName : MESSAGES.enterPrompt}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="input-box"
      />
      <button type="submit" className="submit-button">
        {MESSAGES.submit}
      </button>
    </form>
  );
};

export default InputForm;