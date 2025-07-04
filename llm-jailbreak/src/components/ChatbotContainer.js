import React, { useState, useEffect } from "react";
import ConversationLog from "./ConversationLog";
import InputForm from "./InputForm";
import OptionButtons from "./OptionButtons";
import TypingIndicator from "./TypingIndicator";
import MESSAGES from "./messages";
import './SantaChatbot.css';

const ChatbotContainer = () => {
  const [stage, setStage] = useState(1); // Current stage of the chatbot
  const [, setName] = useState(""); // User's name
  const [conversationLog, setConversationLog] = useState([]); // Chat history
  const [options, setOptions] = useState([1, 2, 3]); // Available options for Stage 2
  const [isTyping, setIsTyping] = useState(false); // Indicates if Santa is typing
  const [showOptions, setShowOptions] = useState(false); // Whether to show options in Stage 2
  const [showPromptInput, setShowPromptInput] = useState(false); // Whether to show options in Stage 2
  const [showGuidelineButtons, setShowGuidelineButtons] = useState(false); // Yes/No buttons for guidelines
  const [inputVisible, setInputVisible] = useState(true); // Controls the visibility of the input field
  const [gameOver, setGameOver] = useState(false); // Whether the game is over
  const [showRetryOrHints, setShowRetryOrHints] = useState(false); // Retry or hints buttons

  useEffect(() => {
    setConversationLog(["Santa:"+MESSAGES.initialGreeting]);
  }, []);

  const addSantaMessage = (message, callback) => {
    setIsTyping(true); // Show typing indicator
    setTimeout(() => {
      setConversationLog((prev) => [...prev, `Santa: ${message}`]);
      setIsTyping(false); // Hide typing indicator
      if (callback) callback(); // Execute callback after message is displayed
    }, 1000);
  };

  const handleNameSubmit = (submittedName) => {
    setName(submittedName);
    setStage(2);
    setConversationLog((prev) => [...prev, MESSAGES.myName + submittedName + "."]);
    addSantaMessage(MESSAGES.santaIntro,
      () => {
        addSantaMessage(MESSAGES.guidelines,
          () => {
            addSantaMessage(
              MESSAGES.guidelinesQuestion,
              () => setShowGuidelineButtons(true) // Show Yes/No buttons
            );
          }
        );
      }
    );
  };

  const handleGuidelineResponse = (response) => {
    let userMessage = "";

    setShowGuidelineButtons(false); // Hide Yes/No buttons
    if (response === "yes") {
      userMessage = MESSAGES.userUnderstood
      setConversationLog((prev) => [...prev, userMessage]);
      addSantaMessage(MESSAGES.santaInstruction1, ()=>{
        addSantaMessage(MESSAGES.santaInstruction2, () => setShowPromptInput(true)); // Show options
      }); // Show options
      
    } else {
      userMessage = MESSAGES.userNotUnderstood
      setConversationLog((prev) => [...prev, userMessage]);

      addSantaMessage(MESSAGES.guidelineRepeat
        ,
        () => {
          addSantaMessage(
            MESSAGES.santaInstruction3,
            () => setShowGuidelineButtons(true) // Show Yes/No buttons again
          );
        }
      );
    }
  };


  const handleOptionSelect = (option, check=true) => {
    let userMessage = "";
    let santaResponse = "";

    if (option === 1) {
      userMessage = MESSAGES.option1;
      santaResponse = MESSAGES.option1Reply;
    } else if (option === 2) {
      userMessage = MESSAGES.option2;
      santaResponse = MESSAGES.option2Reply;
    } else if (option === 3) {
      userMessage = MESSAGES.option3;
      santaResponse = MESSAGES.story;

      setShowOptions(false); // Hide options while Santa is typing
      if (check) {
        setConversationLog((prev) => [...prev, userMessage]);
      }

      // Step 1: Show "Santa is typing..."
      addSantaMessage(MESSAGES.storyIntro, () => {
        // Step 2: Show the story
        addSantaMessage(santaResponse)
        addSantaMessage(MESSAGES.option3Reply3, () => {
          // Step 3: Transition to password input
          setStage(3); // Transition to Stage 3 (password input)
        });
      });
      return;
    }

    setConversationLog((prev) => [...prev, userMessage]);
    setShowOptions(false); // Hide options while Santa is typing
    addSantaMessage(santaResponse, () => setShowOptions(true)); // Show options again after Santa responds
    setOptions((prev) => prev.filter((o) => o !== option));
  };

  const handlePasswordSubmit = (guess) => {
    const userMessage = MESSAGES.passwordIs + ` "${guess}".`;
    setConversationLog((prev) => [...prev, userMessage]);
    setInputVisible(false); // Step 1: Hide the input text field

    // Step 2: "Santa is typing..."
    addSantaMessage(MESSAGES.checkMessage, () => {
      // Step 3: Santa checks the password
      if (guess.trim().toLowerCase() === MESSAGES.correctPassword.toLowerCase()) {
        addSantaMessage(
          MESSAGES.correctPwdMsg,
          () => setGameOver(true) // End the game on a correct guess
        );
      } else {
        addSantaMessage(
          MESSAGES.retryAttempt,
          () => setInputVisible(true)
        );
      }
    });
  };

  const handlePromptSubmit = (prompt) => {
    setShowPromptInput(false); // Hide the prompt input
    setConversationLog((prev) => [...prev, `${prompt}`]);
  
    if (prompt.toLowerCase().includes("geschichte")) {
      // Directly go to Option 3 and tell the story
      handleOptionSelect(3,false);
    } else {
      // Invalid input workflow
      addSantaMessage(MESSAGES.cantDiscloseMsg, () => {
        addSantaMessage(MESSAGES.moreOptions, () => {
          setShowRetryOrHints(true) // Show the retry or hints buttons
        });
      });
    }
  };

  const handleRetryOrHints = (choice) => {
    setShowRetryOrHints(false); // Hide Retry and Hints buttons
  
    if (choice === "retry") {
      setConversationLog((prev) => [...prev, MESSAGES.retryText]);
      addSantaMessage(MESSAGES.retryResponse, () => setShowPromptInput(true)); // Show prompt input
    } else if (choice === "hints") {
      setConversationLog((prev) => [...prev, MESSAGES.hintsRequestText]);
      addSantaMessage(MESSAGES.hintsResponse, () => setShowOptions(true)); // Show original three options
    }
  };


  return (
    <div className="chatbot-container">
      <h1>🎅 Santa's LLM Chatbot 🎅</h1>
      <ConversationLog log={conversationLog} />
      {isTyping && <TypingIndicator />}
      {stage === 1 && <InputForm onSubmitName={handleNameSubmit} />}
      {showGuidelineButtons && (
        <div className="guideline-buttons">
          <button className="option-button" onClick={() => handleGuidelineResponse("yes")}>
            {MESSAGES.userUnderstood}
          </button>
          <button className="option-button" onClick={() => handleGuidelineResponse("no")}>
            {MESSAGES.no}
          </button>
        </div>
      )}
      {showPromptInput && <InputForm onSubmitGuess={handlePromptSubmit} />}
      {showRetryOrHints && (
        <div className="retry-or-hints-buttons">
          <button className="option-button" onClick={() => handleRetryOrHints("retry")}>
            {MESSAGES.retryText}
          </button>
          <button className="option-button" onClick={() => handleRetryOrHints("hints")}>
            {MESSAGES.hintsRequestText}
          </button>
        </div>
      )}
      {stage === 2 && showOptions && <OptionButtons options={options} onOptionSelect={handleOptionSelect} />}
      {stage === 3 && inputVisible && !gameOver && <InputForm onSubmitGuess={handlePasswordSubmit} />}
    </div>
  );
};

export default ChatbotContainer;