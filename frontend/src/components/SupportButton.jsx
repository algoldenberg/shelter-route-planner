import React, { useState } from 'react';
import './styles/SupportButton.css';

const SupportButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePayPal = () => {
    window.open('https://paypal.me/algoldenberga', '_blank');
  };

  const handleBitpay = () => {
    window.open('https://www.bitpay.co.il/app/me/A9D17825-95A2-8D96-68FD-2C86CE671DCEE0EF', '_blank');
  };

  return (
    <>
      {/* Кнопка Support */}
      <button className="support-btn" onClick={openModal}>
         Support Developer
      </button>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <h2>Support the Project</h2>
            <p className="modal-description">
              This is a non-profit project built by a single developer. 
              Your support helps keep the service running and add new features!
            </p>

            <div className="payment-buttons">
              <button className="payment-btn paypal-btn" onClick={handlePayPal}>
                💳 PayPal
                <span className="payment-subtitle">International</span>
              </button>

              <button className="payment-btn bitpay-btn" onClick={handleBitpay}>
                 ₪ Bit
                <span className="payment-subtitle">Israel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButton;