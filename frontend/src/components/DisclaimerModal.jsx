import { useState, useEffect } from 'react';
import './styles/DisclaimerModal.css';

const DisclaimerModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
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
              <strong>Follow Home Front Command guidelines at all times.</strong>
            </p>
          </div>

          <p className="disclaimer-warning">
            Data requires verification. May be incomplete or outdated.
          </p>
          
          <div className="disclaimer-contact">
            <p><strong>Found an error?</strong></p>
            <div className="contact-links">
              <a href="https://t.me/goldenberga" target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
              <a href="https://wa.me/972506967370" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="disclaimer-footer">
          <label className="disclaimer-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don't show again</span>
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