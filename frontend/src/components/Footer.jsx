import './styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">
          © {currentYear} Alex Goldenberg · 12,234 shelters across Israel
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