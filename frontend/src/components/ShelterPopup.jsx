import { useState, useEffect } from 'react';
import { getShelterComments, addShelterComment, reportShelterIssue } from '../services/api';
import './styles/ShelterPopup.css';

const ShelterPopup = ({ shelter, onBuildRoute, currentLocation }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({ text: '', rating: 5, author: '' });
  const [distance, setDistance] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({ issueType: 'closed', comment: '', contact: '' });

  useEffect(() => {
    loadComments();
    calculateDistance();
  }, [shelter]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getShelterComments(shelter._id || shelter.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = () => {
    if (currentLocation) {
      const R = 6371;
      const dLat = (shelter.latitude - currentLocation[0]) * Math.PI / 180;
      const dLon = (shelter.longitude - currentLocation[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(currentLocation[0] * Math.PI / 180) * Math.cos(shelter.latitude * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      setDistance(dist);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;

    try {
      await addShelterComment(shelter._id || shelter.id, {
        comment: newComment.text,
        rating: newComment.rating,
        username: newComment.author || 'Anonymous'
      });
      setNewComment({ text: '', rating: 5, author: '' });
      setShowCommentForm(false);
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportData.comment.trim()) return;
  
    try {
      await reportShelterIssue(shelter._id || shelter.id, reportData);
      setShowReportForm(false);
      setReportData({ issueType: 'closed', comment: '', contact: '' });
      alert('✅ Thank you for reporting this issue! We will review it soon.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('❌ Failed to submit report. Please try again.');
    }
  };

  const handleTouchButton = (callback) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : null;

  return (
    <div className="shelter-popup">
      <div className="shelter-popup__header">
        <h3 className="shelter-popup__title">
          🛡️ {shelter.name || 'Unnamed Shelter'}
        </h3>
        {averageRating && (
          <div className="shelter-popup__rating">
            <span className="stars">{'⭐'.repeat(Math.round(averageRating))}</span>
            <span className="rating-value">{averageRating}</span>
            <span className="rating-count">({comments.length})</span>
          </div>
        )}
      </div>

      <div className="shelter-popup__info">
        {shelter.street && (
          <p className="info-item">
            <span className="icon">📍</span>
            {shelter.street}
          </p>
        )}
        
        <p className="info-item">
          <span className="icon">🏷️</span>
          <strong>Type:</strong> {(shelter.type || 'public_shelter').replace('_', ' ')}
        </p>
        {distance !== null && (
          <p className="info-item">
            <span className="icon">📏</span>
            <strong>Distance:</strong> {distance < 1 
              ? `${(distance * 1000).toFixed(0)}m` 
              : `${distance.toFixed(2)}km`}
          </p>
        )}

        {shelter.distance_from_start !== undefined && (
          <p className="info-item">
            <span className="icon">🚶</span>
            <strong>From start:</strong> {(shelter.distance_from_start / 1000).toFixed(2)}km
          </p>
        )}

        <p className="info-item">
          <span className="icon">📐</span>
          <strong>Coordinates:</strong> {shelter.latitude.toFixed(6)}, {shelter.longitude.toFixed(6)}
        </p>
      </div>

      <div className="shelter-popup__actions">
        <button
          className="btn btn--primary"
          onClick={(e) => {
            e.stopPropagation();
            if (onBuildRoute) {
              onBuildRoute(shelter.latitude, shelter.longitude);
            }
          }}
          onTouchEnd={handleTouchButton(() => {
            if (onBuildRoute) {
              onBuildRoute(shelter.latitude, shelter.longitude);
            }
          })}
        >
          🗺️ Build Route Here
        </button>
        
        <button
          className="btn btn--secondary"
          onClick={(e) => {
            e.stopPropagation();
            const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`;
            window.open(url, '_blank');
          }}
          onTouchEnd={handleTouchButton(() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`;
            window.open(url, '_blank');
          })}
        >
          📍 Open in Google Maps
        </button>

        <button
          className="btn btn--report"
          onClick={(e) => {
            e.stopPropagation();
            setShowReportForm(!showReportForm);
          }}
          onTouchEnd={handleTouchButton(() => setShowReportForm(!showReportForm))}
        >
          🚫 Report Issue
        </button>
      </div>

      {showReportForm && (
        <form className="report-form" onSubmit={handleSubmitReport}>
          <h4>Report an Issue</h4>
          
          <div className="form-group">
            <label>Issue Type:</label>
            <select 
              value={reportData.issueType} 
              onChange={(e) => setReportData({...reportData, issueType: e.target.value})}
              required
            >
              <option value="closed">❌ Shelter closed / doesn't exist</option>
              <option value="wrong_address">📍 Wrong address / coordinates</option>
              <option value="blocked_entrance">🚧 Entrance blocked / inaccessible</option>
              <option value="other">ℹ️ Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Details: *</label>
            <textarea
              value={reportData.comment}
              onChange={(e) => setReportData({...reportData, comment: e.target.value})}
              placeholder="Please describe the issue..."
              rows={3}
              required
              minLength={5}
            />
          </div>

          <div className="form-group">
            <label>Contact (optional):</label>
            <input
              type="text"
              value={reportData.contact}
              onChange={(e) => setReportData({...reportData, contact: e.target.value})}
              placeholder="Email or phone (if you want a response)"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn--outline" 
              onClick={() => setShowReportForm(false)}
              onTouchEnd={handleTouchButton(() => setShowReportForm(false))}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              onTouchEnd={handleTouchButton((e) => {
                if (reportData.comment.trim().length >= 5) {
                  handleSubmitReport(e || new Event('submit'));
                }
              })}
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      <div className="shelter-popup__comments">
        <div className="comments-header">
          <h4>💬 Comments ({comments.length})</h4>
          <button 
            className="btn-text"
            onClick={() => setShowCommentForm(!showCommentForm)}
            onTouchEnd={handleTouchButton(() => setShowCommentForm(!showCommentForm))}
          >
            {showCommentForm ? 'Cancel' : '+ Add Comment'}
          </button>
        </div>

        {showCommentForm && (
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <div className="form-group">
              <label>Rating:</label>
              <select 
                value={newComment.rating} 
                onChange={(e) => setNewComment({...newComment, rating: parseInt(e.target.value)})}
              >
                {[5,4,3,2,1].map(r => (
                  <option key={r} value={r}>{'⭐'.repeat(r)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={newComment.author}
                onChange={(e) => setNewComment({...newComment, author: e.target.value})}
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Share your experience..."
                value={newComment.text}
                onChange={(e) => setNewComment({...newComment, text: e.target.value})}
                rows={3}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn--primary btn--small"
              onTouchEnd={handleTouchButton((e) => {
                if (newComment.text.trim()) {
                  handleSubmitComment(e || new Event('submit'));
                }
              })}
            >
              Submit Comment
            </button>
          </form>
        )}

        {loading ? (
          <p className="loading-text">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="empty-text">No comments yet. Be the first!</p>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.username}</span>
                  <span className="comment-rating">{'⭐'.repeat(comment.rating)}</span>
                </div>
                <p className="comment-text">{comment.comment}</p>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShelterPopup;