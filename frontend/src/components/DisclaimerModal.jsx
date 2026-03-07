import { useState, useEffect } from 'react';
import './styles/DisclaimerModal.css';

const DisclaimerModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Проверяем, показывали ли уже дисклеймер
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    
    if (!hasSeenDisclaimer) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenDisclaimer', 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <h2>⚠️ Important Notice</h2>
        </div>
        
        <div className="disclaimer-content">
          <div className="disclaimer-critical">
            <p>
              <strong>The creator of this application urges you to strictly follow 
              the Home Front Command guidelines at all times.</strong>
            </p>
          </div>

          <p>
            All shelter data is sourced from publicly available information and 
            <strong> requires additional verification</strong>.
          </p>
          
          <p>
            The information provided may be incomplete, outdated, or inaccurate. 
            Always verify shelter availability and accessibility before relying on this data.
          </p>
          
          <div className="disclaimer-contact">
            <p><strong>Found an error?</strong> Please report it:</p>
            <ul>
              <li>
                Telegram: <a href="https://t.me/goldenberga" target="_blank" rel="noopener noreferrer">@goldenberga</a>
              </li>
              <li>
                WhatsApp: <a href="https://wa.me/972506967370" target="_blank" rel="noopener noreferrer">+972 50-696-7370</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="disclaimer-footer">
          <label className="disclaimer-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don't show this again</span>
          </label>
          
          <button className="disclaimer-button" onClick={handleClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;