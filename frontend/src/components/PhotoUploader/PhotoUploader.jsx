import React, { useState, useRef } from 'react';
import './PhotoUploader.css';

/**
 * Universal Photo Uploader Component
 * Supports: drag-n-drop, camera capture (mobile), file selection
 * 
 * Props:
 * - photos: Array of File objects
 * - onPhotosChange: (photos) => void
 * - maxPhotos: number (default: 5)
 * - maxSizeMB: number (default: 10)
 */
const PhotoUploader = ({ 
  photos = [], 
  onPhotosChange, 
  maxPhotos = 5,
  maxSizeMB = 10 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = (fileList) => {
    setError('');
    
    const filesArray = Array.from(fileList);
    const remainingSlots = maxPhotos - photos.length;

    if (filesArray.length > remainingSlots) {
      setError(`You can only upload ${maxPhotos} photos total`);
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    // Add to photos array
    onPhotosChange([...photos, ...validFiles]);
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Remove photo
  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    setError('');
  };

  // Trigger file input
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Trigger camera
  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="photo-uploader">
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            Drag & drop photos here, or
          </p>
          
          <div className="upload-buttons">
            {/* File selector (works on all devices) */}
            <button
              type="button"
              className="btn-upload"
              onClick={openFileSelector}
            >
              📁 Choose from Gallery
            </button>

            {/* Camera (mobile only - hidden on desktop) */}
            <button
              type="button"
              className="btn-camera"
              onClick={openCamera}
            >
              📸 Take Photo
            </button>
          </div>

          <p className="upload-hint">
            Max {maxPhotos} photos, up to {maxSizeMB}MB each
          </p>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="file-input-hidden"
          />

          {/* Camera input (mobile only) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="file-input-hidden"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="photo-previews">
          {photos.map((photo, index) => (
            <div key={index} className="photo-preview">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Preview ${index + 1}`}
                className="preview-image"
              />
              <button
                type="button"
                className="btn-remove"
                onClick={() => removePhoto(index)}
                aria-label="Remove photo"
              >
                ✕
              </button>
              <div className="photo-info">
                {(photo.size / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo counter */}
      {photos.length > 0 && (
        <p className="photo-counter">
          {photos.length} / {maxPhotos} photo{photos.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;