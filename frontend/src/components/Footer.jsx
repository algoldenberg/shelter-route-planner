import { useState, useEffect } from 'react';
import { getShelterStats } from '../services/api';
import './styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [shelterCount, setShelterCount] = useState(12234); // Fallback значение

  useEffect(() => {
    const fetchShelterCount = async () => {
      try {
        const stats = await getShelterStats();
        setShelterCount(stats.total || 12234);
      } catch (error) {
        console.error('Failed to fetch shelter count:', error);
        // Оставляем fallback значение
      }
    };

    fetchShelterCount();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">
          © {currentYear} Alex Goldenberg · {shelterCount.toLocaleString()} shelters across Israel
        </span>
        <span className="footer-divider">·</span>
        <a 
          href="https://maps.app.goo.gl/Kf5x3LqHqiKh4vPM6?g_st=ic" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          Data Source
        </a>
        <span className="footer-divider">·</span>
        <a 
          href="https://github.com/algoldenberg/shelter-route-planner" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
        <span className="footer-divider">·</span>
        <span className="footer-license">MIT License</span>
      </div>
    </footer>
  );
};

export default Footer;