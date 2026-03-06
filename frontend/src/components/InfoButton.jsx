import './styles/InfoButton.css';

const InfoButton = ({ onClick }) => {
  return (
    <button
      className="info-btn"
      onClick={onClick}
      title="How to use this app"
    >
      ℹ️
    </button>
  );
};

export default InfoButton;