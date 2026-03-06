import { useState, useEffect, useRef } from 'react';
import ShelterPopup from './ShelterPopup';
import './styles/BottomSheet.css';

const BottomSheet = ({ shelter, onClose, onBuildRoute, currentLocation, onReportClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef(null);

  useEffect(() => {
    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 150) {
      onClose();
    } else {
      setCurrentY(0);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="bottom-sheet-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Handle */}
        <div 
          className="bottom-sheet__handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet__handle-bar" />
        </div>

        {/* Content */}
        <div className="bottom-sheet__content">
          <ShelterPopup
            shelter={shelter}
            onBuildRoute={onBuildRoute}
            currentLocation={currentLocation}
            onReportClick={onReportClick}
          />
        </div>
      </div>
    </>
  );
};

export default BottomSheet;