import { useState, useEffect } from 'react';
import './styles/ReportModal.css';

const ReportModal = ({ isOpen, onClose, onSubmit, shelterName }) => {
  const [formData, setFormData] = useState({
    issueType: 'closed',
    comment: '',
    contact: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        issueType: 'closed',
        comment: '',
        contact: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim() || formData.comment.length < 5) {
      alert('Please provide at least 5 characters in the details field');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="report-modal-backdrop" onClick={onClose} />

      <div className="report-modal">
        <div className="report-modal__header">
          <h2>🚫 Report Issue</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="report-modal__shelter-name">
          <strong>Shelter:</strong> {shelterName}
        </div>

        <form onSubmit={handleSubmit} className="report-modal__form">
          {/* Issue Type */}
          <div className="form-group">
            <label>Issue Type *</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
            >
              <option value="closed">❌ Shelter closed / doesn't exist</option>
              <option value="wrong_address">📍 Wrong address / coordinates</option>
              <option value="blocked_entrance">🚧 Entrance blocked / inaccessible</option>
              <option value="other">ℹ️ Other</option>
            </select>
          </div>

          {/* Details */}
          <div className="form-group">
            <label>Details *</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Please describe the issue..."
              rows={4}
              required
              minLength={5}
            />
            <small className="help-text">Minimum 5 characters</small>
          </div>

          {/* Contact */}
          <div className="form-group">
            <label>Contact (optional)</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Email or phone (if you want a response)"
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn--outline" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ReportModal;