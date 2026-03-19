import { useState, useEffect } from 'react';

const CURRENT_VERSION = '1.2.1'; // Меняй при каждом обновлении

const PWAUpdateNotice = () => {
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Проверяем, это PWA или обычный браузер
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true;
    
    if (!isPWA) return; // Не показываем в обычном браузере
    
    // Определяем платформу
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const androidDetected = /android/i.test(userAgent);
    setIsAndroid(androidDetected);
    
    // Получаем сохранённую версию
    const savedVersion = localStorage.getItem('pwa_app_version');
    
    // Если версия не совпадает — показываем уведомление
    if (savedVersion && savedVersion !== CURRENT_VERSION) {
      setShowModal(true);
    } else if (!savedVersion) {
      // Первый запуск — просто сохраняем версию, не показываем уведомление
      localStorage.setItem('pwa_app_version', CURRENT_VERSION);
    }
  }, []);

  const handleClose = () => {
    // Сохраняем новую версию
    localStorage.setItem('pwa_app_version', CURRENT_VERSION);
    setShowModal(false);
    setShowInstructions(false);
  };

  if (!showModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {!showInstructions ? (
          <>
            <div style={{
              fontSize: '2rem',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              🔄
            </div>
            
            <h2 style={{
              fontSize: '1.3rem',
              marginBottom: '12px',
              textAlign: 'center',
              color: '#333'
            }}>
              Update Available
            </h2>
            
            <p style={{
              fontSize: '0.95rem',
              lineHeight: '1.5',
              color: '#666',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {isAndroid 
                ? "If you're using this app from your home screen, please remove it and reinstall to get the latest updates."
                : "If you're using this app from your iPhone home screen, please remove it and reinstall to get the latest updates."
              }
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              flexDirection: 'column'
            }}>
              <button
                onClick={() => setShowInstructions(true)}
                style={{
                  padding: '12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                How to do this?
              </button>
              
              <button
                onClick={handleClose}
                style={{
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{
              fontSize: '1.3rem',
              marginBottom: '16px',
              color: '#333'
            }}>
              {isAndroid ? '🤖 How to Reinstall (Android)' : '📱 How to Reinstall (iOS)'}
            </h2>
            
            {isAndroid ? (
              // Android инструкция
              <ol style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#666',
                paddingLeft: '20px',
                marginBottom: '20px'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Press and hold</strong> the app icon on your home screen
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tap <strong>"Remove"</strong> or <strong>"Uninstall"</strong>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Open <strong>Chrome</strong> and go to <code style={{
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '0.9rem'
                  }}>shelternearyou.online</code>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tap the <strong>menu</strong> (three dots ⋮)
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                </li>
                <li>
                  Tap <strong>"Add"</strong> to confirm
                </li>
              </ol>
            ) : (
              // iOS инструкция
              <ol style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#666',
                paddingLeft: '20px',
                marginBottom: '20px'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Press and hold</strong> the app icon on your home screen
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tap <strong>"Remove App"</strong>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Open <strong>Safari</strong> and go to <code style={{
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '0.9rem'
                  }}>shelternearyou.online</code>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Tap the <strong>Share</strong> button (box with arrow)
                </li>
                <li>
                  Tap <strong>"Add to Home Screen"</strong>
                </li>
              </ol>
            )}
            
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PWAUpdateNotice;