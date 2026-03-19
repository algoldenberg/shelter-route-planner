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
              <a href="mailto:shelternearyou@gmail.com" rel="noopener noreferrer">
                shelternearyou@gmail.com
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
          
          <p className="privacy-notice">
            By clicking "I Understand" you agree to our{' '}
            <a href="/privacy" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
          
          <button className="disclaimer-button" onClick={handleClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;