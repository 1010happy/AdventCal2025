import React from "react";
import MESSAGES from "./messages";

const OptionButtons = ({ options, onOptionSelect }) => {
  const buttonLabels = {
    1: MESSAGES.option1,
    2: MESSAGES.option2,
    3: MESSAGES.option3,
  };

  return (
    <div>
      {options.map((option) => (
        <button
          key={option}
          class="option-button" 
          onClick={() => onOptionSelect(option)}
          className="option-button"
        >
          {buttonLabels[option]}
        </button>
      ))}
    </div>
  );
};

export default OptionButtons;