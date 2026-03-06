import { useNavigate } from 'react-router-dom';
import './InfoPage.css';

const InfoPage = () => {
  const navigate = useNavigate();

  const switchLang = (lang) => {
    document.querySelectorAll('.lang-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-lang-btn="${lang}"]`).classList.add('active');

    document.querySelectorAll('.content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(lang).classList.add('active');
  };

  return (
    <div className="info-page">
      <button className="close-btn" onClick={() => navigate('/')}>✕</button>
      
      <div className="container">
        <div className="header">
          <h1>🛡️ Shelter Route Planner</h1>
        </div>

        <div className="lang-tabs">
          <button className="lang-tab active" data-lang-btn="en" onClick={() => switchLang('en')}>🇬🇧 English</button>
          <button className="lang-tab" data-lang-btn="he" onClick={() => switchLang('he')}>🇮🇱 עברית</button>
          <button className="lang-tab" data-lang-btn="ru" onClick={() => switchLang('ru')}>🇷🇺 Русский</button>
        </div>

        {/* ENGLISH */}
        <div className="content active" id="en" data-lang="en">
          <div className="section">
            <div className="section-title">📖 What is this?</div>
            <p>An app to find bomb shelters in Israel and plan safe routes through multiple shelters.</p>
          </div>

          <div className="section">
            <div className="section-title">🔍 Main Features</div>
            
            <div className="feature">
              <div className="feature-title">1. Find Nearest Shelter</div>
              <ul>
                <li>Open the site — your location is detected automatically</li>
                <li>Bottom of screen shows distance to nearest shelter</li>
                <li>Tap this box to open shelter details</li>
              </ul>
            </div>

            <div className="feature">
              <div className="feature-title">2. Search Shelters Elsewhere</div>
              <ul>
                <li>"Find Shelters" tab</li>
                <li>Enter address or select from list</li>
                <li>Tap "Search Shelters"</li>
                <li>Map shows all shelters within 1km radius</li>
              </ul>
            </div>

            <div className="feature">
              <div className="feature-title">3. Build a Route</div>
              <ul>
                <li>"Plan Route" tab</li>
                <li>Set start and end points</li>
                <li>Tap "Calculate Route"</li>
                <li>App shows route through shelters along the way</li>
              </ul>
            </div>

            <div className="feature">
              <div className="feature-title">4. Follow Your Position</div>
              <ul>
                <li>Tap 🧭 (compass) button bottom-right</li>
                <li>Map follows you in real-time</li>
                <li>Shows GPS accuracy (blue circle around you)</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <div className="section-title">➕ Add New Shelter</div>
            <p style={{marginBottom: '12px'}}>Know a shelter that's not on the map?</p>
            <ul style={{marginLeft: '20px', color: '#a1a1aa'}}>
              <li>Tap ➕ bottom-right</li>
              <li>Choose location method</li>
              <li>Fill in info: Shelter name, Type, Capacity, Instructions</li>
              <li>Tap "Submit Shelter"</li>
            </ul>
            <div className="success">✅ Your suggestion will be reviewed and added!</div>
          </div>

          <div className="section">
            <div className="section-title">🚫 Report an Issue</div>
            <p style={{marginBottom: '12px'}}>Shelter closed or wrong address?</p>
            <ul style={{marginLeft: '20px', color: '#a1a1aa'}}>
              <li>Open shelter info (tap marker)</li>
              <li>Tap "Report Issue"</li>
              <li>Select problem type</li>
              <li>Describe the problem</li>
              <li>Tap "Submit Report"</li>
            </ul>
          </div>

          <div className="section">
            <div className="section-title">📱 Install on Phone</div>
            <div className="phone-section">
              <div className="phone-card">
                <div className="phone-card-title">iPhone (Safari)</div>
                <ol>
                  <li>Open site in Safari</li>
                  <li>Tap "Share" button</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Tap "Add"</li>
                </ol>
              </div>
              <div className="phone-card">
                <div className="phone-card-title">Android (Chrome)</div>
                <ol>
                  <li>Open site in Chrome</li>
                  <li>Tap menu (three dots)</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Tap "Add"</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="contact">
            <div className="contact-title">📧 Contact</div>
            <p style={{marginBottom: '12px', color: '#a1a1aa'}}>Found a bug or have suggestions?</p>
            <div className="contact-links">
              <a href="https://t.me/goldenberga" className="contact-link" target="_blank" rel="noopener noreferrer">Telegram: @goldenberga</a>
              <a href="https://wa.me/972506967370" className="contact-link" target="_blank" rel="noopener noreferrer">WhatsApp: 0506967370</a>
            </div>
          </div>
        </div>

        {/* HEBREW */}
        <div className="content" id="he" data-lang="he">
        <div className="section">
            <div className="section-title">📖 מה זה?</div>
            <p>אפליקציה למציאת מקלטים בישראל ולתכנון מסלולים בטוחים דרך מספר מקלטים.</p>
        </div>

        <div className="section">
            <div className="section-title">🔍 פונקציות עיקריות</div>
            
            <div className="feature">
            <div className="feature-title">1. מצא מקלט קרוב</div>
            <ul>
                <li>פתח את האתר — המיקום שלך מזוהה אוטומטית</li>
                <li>בתחתית המסך רואים מרחק למקלט הקרוב ביותר</li>
                <li>לחץ על התיבה הזו כדי לפתוח מידע על המקלט</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">2. חיפוש מקלטים במקום אחר</div>
            <ul>
                <li>כרטיסייה "Find Shelters"</li>
                <li>הזן כתובת או בחר מהרשימה</li>
                <li>לחץ "Search Shelters"</li>
                <li>על המפה יופיעו כל המקלטים ברדיוס של 1 ק"מ</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">3. בניית מסלול</div>
            <ul>
                <li>כרטיסייה "Plan Route"</li>
                <li>קבע נקודת התחלה וסיום</li>
                <li>לחץ "Calculate Route"</li>
                <li>האפליקציה תציג מסלול דרך מקלטים בדרך</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">4. עקוב אחר המיקום שלך</div>
            <ul>
                <li>לחץ על כפתור 🧭 (מצפן) בפינה הימנית התחתונה</li>
                <li>המפה תעקוב אחריך בזמן אמת</li>
                <li>מציג דיוק GPS (מעגל כחול סביבך)</li>
            </ul>
            </div>
        </div>

        <div className="section">
            <div className="section-title">➕ הוסף מקלט חדש</div>
            <p style={{marginBottom: '12px'}}>יודע על מקלט שלא במפה?</p>
            <ul style={{marginRight: '20px', color: '#a1a1aa'}}>
            <li>לחץ ➕ בפינה הימנית התחתונה</li>
            <li>בחר שיטת ציון מיקום</li>
            <li>מלא פרטים: שם המקלט, סוג, קיבולת, הוראות כניסה</li>
            <li>לחץ "Submit Shelter"</li>
            </ul>
            <div className="success">✅ ההצעה שלך תיבדק ותתווסף!</div>
        </div>

        <div className="section">
            <div className="section-title">🚫 דווח על בעיה</div>
            <p style={{marginBottom: '12px'}}>המקלט סגור או הכתובת שגויה?</p>
            <ul style={{marginRight: '20px', color: '#a1a1aa'}}>
            <li>פתח מידע על המקלט (לחץ על הסמן)</li>
            <li>לחץ "Report Issue"</li>
            <li>בחר סוג בעיה</li>
            <li>תאר את הבעיה</li>
            <li>לחץ "Submit Report"</li>
            </ul>
        </div>

        <div className="section">
            <div className="section-title">📱 התקנה בטלפון</div>
            <div className="phone-section">
            <div className="phone-card">
                <div className="phone-card-title">iPhone (Safari)</div>
                <ol>
                <li>פתח את האתר ב-Safari</li>
                <li>לחץ על כפתור "שתף"</li>
                <li>בחר "הוסף למסך הבית"</li>
                <li>לחץ "הוסף"</li>
                </ol>
            </div>
            <div className="phone-card">
                <div className="phone-card-title">Android (Chrome)</div>
                <ol>
                <li>פתח את האתר ב-Chrome</li>
                <li>לחץ תפריט (שלוש נקודות)</li>
                <li>בחר "הוסף למסך הבית"</li>
                <li>לחץ "הוסף"</li>
                </ol>
            </div>
            </div>
        </div>

        <div className="contact">
            <div className="contact-title">📧 יצירת קשר</div>
            <p style={{marginBottom: '12px', color: '#a1a1aa'}}>מצאת באג או יש הצעות?</p>
            <div className="contact-links">
            <a href="https://t.me/goldenberga" className="contact-link" target="_blank" rel="noopener noreferrer">טלגרם: @goldenberga</a>
            <a href="https://wa.me/972506967370" className="contact-link" target="_blank" rel="noopener noreferrer">וואטסאפ: 0506967370</a>
            </div>
        </div>
        </div>

        {/* RUSSIAN */}
        <div className="content" id="ru" data-lang="ru">
        <div className="section">
            <div className="section-title">📖 Что это такое?</div>
            <p>Приложение для поиска бомбоубежищ в Израиле и построения безопасных маршрутов через несколько укрытий.</p>
        </div>

        <div className="section">
            <div className="section-title">🔍 Основные функции</div>
            
            <div className="feature">
            <div className="feature-title">1. Найти ближайшее укрытие</div>
            <ul>
                <li>Откройте сайт — ваша геолокация определится автоматически</li>
                <li>Внизу экрана видно расстояние до ближайшего укрытия</li>
                <li>Нажмите на это окошко, чтобы открыть информацию об укрытии</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">2. Поиск укрытий в другом месте</div>
            <ul>
                <li>Вкладка "Find Shelters"</li>
                <li>Введите адрес или выберите из списка</li>
                <li>Нажмите "Search Shelters"</li>
                <li>На карте появятся все укрытия в радиусе 1 км</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">3. Построить маршрут</div>
            <ul>
                <li>Вкладка "Plan Route"</li>
                <li>Укажите начальную и конечную точку</li>
                <li>Нажмите "Calculate Route"</li>
                <li>Приложение покажет маршрут через укрытия по пути</li>
            </ul>
            </div>

            <div className="feature">
            <div className="feature-title">4. Следить за своей позицией</div>
            <ul>
                <li>Нажмите кнопку 🧭 (компас) справа внизу</li>
                <li>Карта будет следовать за вами в реальном времени</li>
                <li>Показывает точность GPS (синий круг вокруг вас)</li>
            </ul>
            </div>
        </div>

        <div className="section">
            <div className="section-title">➕ Добавить новое укрытие</div>
            <p style={{marginBottom: '12px'}}>Знаете укрытие, которого нет на карте?</p>
            <ul style={{marginLeft: '20px', color: '#a1a1aa'}}>
            <li>Нажмите ➕ справа внизу</li>
            <li>Выберите способ указания места</li>
            <li>Заполните информацию: Название, Тип, Вместимость, Инструкция</li>
            <li>Нажмите "Submit Shelter"</li>
            </ul>
            <div className="success">✅ Ваше предложение будет проверено и добавлено на карту!</div>
        </div>

        <div className="section">
            <div className="section-title">🚫 Сообщить о проблеме</div>
            <p style={{marginBottom: '12px'}}>Укрытие закрыто или адрес неправильный?</p>
            <ul style={{marginLeft: '20px', color: '#a1a1aa'}}>
            <li>Откройте информацию об укрытии (кликните на маркер)</li>
            <li>Нажмите "Report Issue"</li>
            <li>Выберите тип проблемы</li>
            <li>Опишите проблему</li>
            <li>Нажмите "Submit Report"</li>
            </ul>
        </div>

        <div className="section">
            <div className="section-title">📱 Установить на телефон</div>
            <div className="phone-section">
            <div className="phone-card">
                <div className="phone-card-title">iPhone (Safari)</div>
                <ol>
                <li>Откройте сайт в Safari</li>
                <li>Нажмите кнопку "Поделиться"</li>
                <li>Выберите "На экран «Домой»"</li>
                <li>Нажмите "Добавить"</li>
                </ol>
            </div>
            <div className="phone-card">
                <div className="phone-card-title">Android (Chrome)</div>
                <ol>
                <li>Откройте сайт в Chrome</li>
                <li>Нажмите меню (три точки)</li>
                <li>Выберите "Добавить на главный экран"</li>
                <li>Нажмите "Добавить"</li>
                </ol>
            </div>
            </div>
        </div>

        <div className="contact">
            <div className="contact-title">📧 Контакты</div>
            <p style={{marginBottom: '12px', color: '#a1a1aa'}}>Нашли ошибку или есть предложения?</p>
            <div className="contact-links">
            <a href="https://t.me/goldenberga" className="contact-link" target="_blank" rel="noopener noreferrer">Telegram: @goldenberga</a>
            <a href="https://wa.me/972506967370" className="contact-link" target="_blank" rel="noopener noreferrer">WhatsApp: 0506967370</a>
            </div>
        </div>
        </div>
        
        
        <div className="footer">
          <div className="shield">🛡️</div>
          <p>Stay safe! | היו בטוחים! | Берегите себя!</p>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;