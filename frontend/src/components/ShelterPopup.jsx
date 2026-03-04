import { useState, useEffect } from 'react';
import { getShelterComments, addShelterComment } from '../services/api';
import './styles/ShelterPopup.css';

const ShelterPopup = ({ shelter, onBuildRoute, currentLocation }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({ text: '', rating: 5, author: '' });
  const [distance, setDistance] = useState(null);

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
      const R = 6371; // Earth radius in km
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
        comment: newComment.text,     // ← text → comment
        rating: newComment.rating,
        username: newComment.author || 'Anonymous'  // ← author → username
      });
      setNewComment({ text: '', rating: 5, author: '' });
      setShowCommentForm(false);
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : null;

  return (
    <div className="shelter-popup">
      {/* Header */}
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

      {/* Info */}
      <div className="shelter-popup__info">
        {shelter.street && (
          <p className="info-item">
            <span className="icon">📍</span>
            {shelter.street}
          </p>
        )}
        
        <p className="info-item">
          <span className="icon">🏷️</span>
          <strong>Type:</strong> {shelter.type.replace('_', ' ')}
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

      {/* Actions */}
      <div className="shelter-popup__actions">
        <button
          className="btn btn--primary"
          onClick={(e) => {
            e.stopPropagation();
            if (onBuildRoute) {
              onBuildRoute(shelter.latitude, shelter.longitude);
            }
          }}
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
        >
          📍 Open in Google Maps
        </button>
      </div>

      {/* Comments Section */}
      <div className="shelter-popup__comments">
        <div className="comments-header">
          <h4>💬 Comments ({comments.length})</h4>
          <button 
            className="btn-text"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            {showCommentForm ? 'Cancel' : '+ Add Comment'}
          </button>
        </div>

        {/* Comment Form */}
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
            <button type="submit" className="btn btn--primary btn--small">
              Submit Comment
            </button>
          </form>
        )}

        {/* Comments List */}
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