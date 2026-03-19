import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './PrivacyPage.css';

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      title: '🔒 Privacy Policy',
      lastUpdated: 'Last Updated: March 19, 2026',
      intro: 'ShelterNearYou ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your data when you use our shelter location service.',
      sections: [
        {
          title: '1. Data We Collect',
          content: [
            '• Location Data: GPS coordinates when you search for nearby shelters',
            '• Device Information: Browser type, operating system, device model (User-Agent)',
            '• Usage Statistics: Pages visited, features used, interaction timestamps',
            '• User Submissions: When you submit new shelters or report issues, we collect the content you provide along with your IP address'
          ]
        },
        {
          title: '2. IP Address Collection (Partial)',
          content: [
            'We collect IP addresses in limited cases:',
            '',
            '• Website Access: When you visit shelternearyou.online, our web server (Nginx) logs your IP address for security monitoring and traffic analysis.',
            '',
            '• Shelter Submissions: When you submit a new shelter location, we collect your IP address to prevent spam and abuse. This IP is stored alongside your submission.',
            '',
            '• Regular App Usage: When you search for shelters, build routes, or browse the map, we do NOT collect your IP address due to our Docker-based architecture with NAT (Network Address Translation). These actions are logged with internal container IP addresses only.'
          ]
        },
        {
          title: '3. Why We Collect This Data',
          content: [
            '• Service Delivery: Find shelters near your location',
            '• Service Improvement: Analyze usage patterns to improve shelter coverage',
            '• Security & Anti-Abuse: Detect and prevent spam, bots, malicious activity',
            '• Analytics: Understand which areas need better shelter data',
            '• Technical Operations: Monitor system performance and fix issues'
          ]
        },
        {
          title: '4. Data Storage & Security',
          content: [
            '• Location: All data stored on secure servers in Israel',
            '• Retention: Usage logs retained for 30 days, then automatically deleted via MongoDB TTL index',
            '• Security: Industry-standard encryption and access controls',
            '• No Third-Party Sharing: Your data is never sold or shared with third parties',
            '• Database: MongoDB 7.0 with authentication and restricted access'
          ]
        },
        {
          title: '5. Your Rights',
          content: [
            '• Access: Request a copy of your data',
            '• Deletion: Request deletion of your data',
            '• Correction: Update incorrect information',
            '• Opt-Out: Stop using the service to stop data collection',
            '',
            'Contact us at shelternearyou@gmail.com to exercise these rights.'
          ]
        },
        {
          title: '6. Legal Basis',
          content: [
            'We process your data under legitimate interest to provide a public safety service during emergency situations. Data collection complies with Israel\'s Protection of Privacy Law, 5741-1981.'
          ]
        },
        {
          title: '7. Changes to This Policy',
          content: [
            'We may update this Privacy Policy. Changes will be posted on this page with an updated "Last Updated" date.'
          ]
        },
        {
          title: '8. Contact',
          content: [
            'Questions or concerns about privacy?',
            'Email: shelternearyou@gmail.com'
          ]
        }
      ]
    },
    he: {
      title: '🔒 מדיניות פרטיות',
      lastUpdated: 'עודכן לאחרונה: 19 במרץ 2026',
      intro: 'ShelterNearYou ("אנחנו", "שלנו") מכבדת את פרטיותך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על הנתונים שלך בעת שימוש בשירות איתור המקלטים שלנו.',
      sections: [
        {
          title: '1. נתונים שאנו אוספים',
          content: [
            '• נתוני מיקום: קואורדינטות GPS כאשר אתה מחפש מקלטים קרובים',
            '• מידע על המכשיר: סוג דפדפן, מערכת הפעלה, דגם מכשיר (User-Agent)',
            '• סטטיסטיקות שימוש: דפים שבוקרו, תכונות בשימוש, חותמות זמן של אינטראקציות',
            '• הגשות משתמשים: כאשר אתה מגיש מקלטים חדשים או מדווח על בעיות, אנו אוספים את התוכן שאתה מספק יחד עם כתובת ה-IP שלך'
          ]
        },
        {
          title: '2. איסוף כתובות IP (חלקי)',
          content: [
            'אנו אוספים כתובות IP במקרים מוגבלים:',
            '',
            '• גישה לאתר: כאשר אתה מבקר ב-shelternearyou.online, שרת האינטרנט שלנו (Nginx) רושם את כתובת ה-IP שלך לצורכי ניטור אבטחה וניתוח תעבורה.',
            '',
            '• הגשת מקלטים: כאשר אתה מגיש מיקום מקלט חדש, אנו אוספים את כתובת ה-IP שלך כדי למנוע ספאם ושימוש לרעה. כתובת IP זו נשמרת לצד ההגשה שלך.',
            '',
            '• שימוש רגיל באפליקציה: כאשר אתה מחפש מקלטים, בונה מסלולים או גולש במפה, אנו לא אוספים את כתובת ה-IP שלך בשל הארכיטקטורה המבוססת על Docker עם NAT (Network Address Translation). פעולות אלה נרשמות רק עם כתובות IP פנימיות של קונטיינרים.'
          ]
        },
        {
          title: '3. למה אנו אוספים נתונים אלה',
          content: [
            '• אספקת שירות: מציאת מקלטים ליד המיקום שלך',
            '• שיפור שירות: ניתוח דפוסי שימוש לשיפור כיסוי המקלטים',
            '• אבטחה ומניעת שימוש לרעה: זיהוי ומניעת ספאם, בוטים, פעילות זדונית',
            '• אנליטיקה: הבנה באילו אזורים נדרשים נתוני מקלט טובים יותר',
            '• תפעול טכני: ניטור ביצועי המערכת ותיקון בעיות'
          ]
        },
        {
          title: '4. אחסון נתונים ואבטחה',
          content: [
            '• מיקום: כל הנתונים מאוחסנים בשרתים מאובטחים בישראל',
            '• שמירה: יומני שימוש נשמרים למשך 30 יום, ולאחר מכן נמחקים אוטומטית באמצעות MongoDB TTL index',
            '• אבטחה: הצפנה ובקרות גישה בסטנדרט התעשייה',
            '• ללא שיתוף צד שלישי: הנתונים שלך לעולם לא נמכרים או משותפים עם צדדים שלישיים',
            '• מסד נתונים: MongoDB 7.0 עם אימות וגישה מוגבלת'
          ]
        },
        {
          title: '5. הזכויות שלך',
          content: [
            '• גישה: בקשת עותק של הנתונים שלך',
            '• מחיקה: בקשת מחיקת הנתונים שלך',
            '• תיקון: עדכון מידע שגוי',
            '• ביטול הסכמה: הפסקת שימוש בשירות כדי להפסיק איסוף נתונים',
            '',
            'צור קשר בכתובת shelternearyou@gmail.com כדי לממש זכויות אלה.'
          ]
        },
        {
          title: '6. בסיס משפטי',
          content: [
            'אנו מעבדים את הנתונים שלך תחת עניין לגיטימי לספק שירות ביטחון ציבורי במהלך מצבי חירום. איסוף הנתונים עומד בחוק הגנת הפרטיות, תשמ"א-1981.'
          ]
        },
        {
          title: '7. שינויים במדיניות זו',
          content: [
            'אנו עשויים לעדכן את מדיניות הפרטיות הזו. שינויים יפורסמו בעמוד זה עם תאריך "עודכן לאחרונה" מעודכן.'
          ]
        },
        {
          title: '8. יצירת קשר',
          content: [
            'שאלות או חששות לגבי פרטיות?',
            'אימייל: shelternearyou@gmail.com'
          ]
        }
      ]
    },
    ru: {
      title: '🔒 Политика конфиденциальности',
      lastUpdated: 'Последнее обновление: 19 марта 2026',
      intro: 'ShelterNearYou ("мы", "наш") уважает вашу конфиденциальность. Эта Политика конфиденциальности объясняет, как мы собираем, используем и защищаем ваши данные при использовании нашего сервиса поиска убежищ.',
      sections: [
        {
          title: '1. Данные, которые мы собираем',
          content: [
            '• Данные о местоположении: GPS координаты при поиске ближайших убежищ',
            '• Информация об устройстве: Тип браузера, операционная система, модель устройства (User-Agent)',
            '• Статистика использования: Посещённые страницы, использованные функции, временные метки взаимодействий',
            '• Пользовательские отправки: Когда вы отправляете новые убежища или сообщаете о проблемах, мы собираем предоставленный вами контент вместе с вашим IP-адресом'
          ]
        },
        {
          title: '2. Сбор IP-адресов (частичный)',
          content: [
            'Мы собираем IP-адреса в ограниченных случаях:',
            '',
            '• Доступ к сайту: Когда вы посещаете shelternearyou.online, наш веб-сервер (Nginx) логирует ваш IP-адрес для мониторинга безопасности и анализа трафика.',
            '',
            '• Отправка убежищ: Когда вы отправляете новое местоположение убежища, мы собираем ваш IP-адрес для предотвращения спама и злоупотреблений. Этот IP хранится вместе с вашей отправкой.',
            '',
            '• Обычное использование приложения: Когда вы ищете убежища, строите маршруты или просматриваете карту, мы НЕ собираем ваш IP-адрес из-за нашей архитектуры на базе Docker с NAT (Network Address Translation). Эти действия логируются только с внутренними IP-адресами контейнеров.'
          ]
        },
        {
          title: '3. Зачем мы собираем эти данные',
          content: [
            '• Предоставление сервиса: Поиск убежищ рядом с вашим местоположением',
            '• Улучшение сервиса: Анализ паттернов использования для улучшения покрытия убежищ',
            '• Безопасность и защита от злоупотреблений: Обнаружение и предотвращение спама, ботов, вредоносной активности',
            '• Аналитика: Понимание, в каких областях нужны лучшие данные об убежищах',
            '• Технические операции: Мониторинг производительности системы и устранение проблем'
          ]
        },
        {
          title: '4. Хранение и безопасность данных',
          content: [
            '• Местоположение: Все данные хранятся на защищённых серверах в Израиле',
            '• Срок хранения: Логи использования хранятся 30 дней, затем автоматически удаляются через MongoDB TTL index',
            '• Безопасность: Шифрование и контроль доступа по отраслевым стандартам',
            '• Без передачи третьим лицам: Ваши данные никогда не продаются и не передаются третьим лицам',
            '• База данных: MongoDB 7.0 с аутентификацией и ограниченным доступом'
          ]
        },
        {
          title: '5. Ваши права',
          content: [
            '• Доступ: Запросить копию ваших данных',
            '• Удаление: Запросить удаление ваших данных',
            '• Исправление: Обновить неверную информацию',
            '• Отказ: Прекратить использование сервиса для прекращения сбора данных',
            '',
            'Свяжитесь с нами по адресу shelternearyou@gmail.com для осуществления этих прав.'
          ]
        },
        {
          title: '6. Правовая основа',
          content: [
            'Мы обрабатываем ваши данные на основе законного интереса предоставления услуги общественной безопасности в чрезвычайных ситуациях. Сбор данных соответствует Закону Израиля о защите конфиденциальности, 5741-1981.'
          ]
        },
        {
          title: '7. Изменения в этой политике',
          content: [
            'Мы можем обновлять эту Политику конфиденциальности. Изменения будут опубликованы на этой странице с обновлённой датой "Последнее обновление".'
          ]
        },
        {
          title: '8. Контакты',
          content: [
            'Вопросы или опасения по поводу конфиденциальности?',
            'Email: shelternearyou@gmail.com'
          ]
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="privacy-page">
      <button className="close-btn" onClick={() => navigate('/')}>✕</button>
      
      <div className="privacy-container">
        <div className="header">
          <h1>{currentContent.title}</h1>
          <p className="last-updated">{currentContent.lastUpdated}</p>
        </div>

        <div className="lang-tabs">
          <button 
            className={`lang-tab ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            🇬🇧 English
          </button>
          <button 
            className={`lang-tab ${language === 'he' ? 'active' : ''}`}
            onClick={() => setLanguage('he')}
          >
            🇮🇱 עברית
          </button>
          <button 
            className={`lang-tab ${language === 'ru' ? 'active' : ''}`}
            onClick={() => setLanguage('ru')}
          >
            🇷🇺 Русский
          </button>
        </div>

        <div className={`privacy-content ${language === 'he' ? 'rtl' : 'ltr'}`}>
          <p className="intro">{currentContent.intro}</p>

          {currentContent.sections.map((section, index) => (
            <div key={index} className="privacy-section">
              <div className="section-title">{section.title}</div>
              {section.content.map((item, itemIndex) => (
                <p key={itemIndex}>{item}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="footer">
          <div className="shield">🛡️</div>
          <p>Your privacy matters | הפרטיות שלך חשובה | Ваша конфиденциальность важна</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;