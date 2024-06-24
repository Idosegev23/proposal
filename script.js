// אתחול OAuth 2.0 Client
function initClient() {
    gapi.client.init({
        clientId: '773526387599-e7plamuuek9uobg1m4grf5ij30t7sfhg.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/gmail.send'
    }).then(() => {
        console.log('OAuth 2.0 Client initialized');
    }).catch(error => {
        console.error('Error initializing OAuth 2.0 Client:', error);
        gapi.auth2.getAuthInstance().signIn().then(() => {
            console.log('Manual sign-in successful');
        }).catch(signInError => {
            console.error('Manual sign-in failed:', signInError);
        });
    });
}

// טעינת Google API Client
gapi.load('client:auth2', initClient);

// פונקציה להוספת מאזיני אירועים
function addEventListeners() {
    document.getElementById('signButton')?.addEventListener('click', showSignaturePopup);
    document.getElementById('closePopup')?.addEventListener('click', hideSignaturePopup);
    document.getElementById('submitSignature')?.addEventListener('click', handleSignatureSubmit);
    document.getElementById('whatsappButton')?.addEventListener('click', openWhatsApp);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScroll);
    });
}

// פונקציות לטיפול באירועים
function showSignaturePopup() {
    document.getElementById('signaturePopup').style.display = 'block';
}

function hideSignaturePopup() {
    document.getElementById('signaturePopup').style.display = 'none';
}

function openWhatsApp() {
    window.open('https://wa.me/972547667775?text=היי%20עידו%20אנחנו%20נשמח%20לעוד%20פרטים', '_blank');
}

function smoothScroll(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
    });
}

// הגדרות ליצירת חתימה באמצעות העכבר
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas?.getContext('2d', { willReadFrequently: true });
let drawing = false;

if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
}

function startDrawing() {
    drawing = true;
    ctx.beginPath();
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// פונקציה לשליחת המייל באמצעות Gmail API
async function sendEmail(to, subject, body) {
    const accessToken = gapi.auth.getToken().access_token;
    const message = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        `To: ${to}\n`,
        'From: Triroars@gmail.com\n',
        'Cc: Triroars@gmail.com\n',
        `Subject: ${subject}\n\n`,
        body
    ].join('');

    try {
        const result = await gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {
                'raw': btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_')
            }
        });
        console.log('Email sent:', result);
        alert('המייל נשלח בהצלחה!');
    } catch (error) {
        console.error('Error sending email:', error);
        alert('שגיאה בשליחת המייל. אנא נסה שוב.');
    }
}

// טיפול בשליחת החתימה
function handleSignatureSubmit() {
    const signatureDataURL = canvas.toDataURL('image/png');
    
    const emailSubject = 'אישור הצעת מחיר - TriRoars לחברת Homerun';
    const emailBody = `
הצעת מחיר לריטיינר חודשי עבור חברת Homerun

שלום,

שמי עידו שגב, מנכ"ל חברת TriRoars. אנו מתמחים בהדרכה ובהטמעת פתרונות בינה מלאכותית ואוטומציה עסקית המותאמים אישית לצרכי הלקוחות שלנו. אני שמח להציע לכם תוכנית עבודה חודשית בריטיינר הכוללת מגוון רחב של שירותים שיקדמו את ניהול העסק שלכם אל המחר.

פרטי השירותים:
1. יצירת בוט וואטסאפ ואתר מבוסס בינה מלאכותית: פיתוח והטמעת בוט שיטפל בתקשורת עם לקוחות באתר ובוואטסאפ, תוך שימוש בכלי AI מתקדמים.
2. יצירת אוטומציות מלאות לניהול העסק: אוטומציה של תהליכים קריטיים כמו מעקב לידים, ניהול סוכנים וניהול נכסים.
3. טיוב הלקוחות לתוך מערכות ה-CRM: הטמעת תהליכים לארגון ושיפור הנתונים של לקוחותיכם בתוך מערכת ה-CRM.
4. יצירת אוטומציה של פרסום בפלטפורמות הקיימות: אוטומציה של קמפיינים פרסומיים בפלטפורמות שונות כדי להגדיל את היעילות והדיוק של הפרסום.
5. יצירת בוט פרסום: פיתוח בוטים שמנהלים את תהליכי הפרסום בצורה חכמה ומותאמת אישית.
6. יצירת פלואו לקוח אומניצ'אנל: מעבר בין פלטפורמות שונות לניהול פרסונאלי של הלקוח, לשיפור חוויית הלקוח וניהול יעיל.

כל השינויים, ההתאמות והעדכונים כלולים במחיר הריטיינר החודשי. עם זאת, פרויקטים נוספים מעבר לשירותים הנ"ל יהיו כרוכים בעלות נוספת.

אנו מחויבים לשמירה על סודיות מלאה של המידע העסקי שלכם. כל החומרים שנוצרים במהלך העבודה יהיו בבעלותכם המלאה ולא ייעשה בהם שימוש אחר ללא אישורכם.

אחריות ושיתוף פעולה:
אנו, ב-TriRoars, לוקחים אחריות מלאה על כל פרויקט שאנו מבצעים, מהתכנון הראשוני ועד לביצוע בפועל. אנו מתחייבים לספק שירות ברמה הגבוהה ביותר ולהבטיח שכל פרויקט יבוצע בהתאם לתוכניות וללוחות הזמנים שנקבעו.

לצורך מימוש הפרויקטים בהצלחה, אנו מבקשים שהלקוח יקצה צוות עבודה מתאים ויפנה את הזמן הדרוש לפגישות ולהנחיות. אנו ניפגש על בסיס שבועי לעדכון על התקדמות העבודה, בין אם בפגישה פרונטלית או בזום, כדי לוודא שהפרויקט מתקדם בצורה חלקה ושהצרכים שלכם מתמלאים במלואם.

תנאי ההתקשרות:
ריטיינר חודשי: 5,000 ש"ח
כל השינויים וההתאמות במסגרת השירותים הכלולים בריטיינר כלולים במחיר החודשי.
פרויקטים נוספים או התאמות שאינם כלולים בשירותים המוצעים יהיו כרוכים בעלות נוספת.

חתימה דיגיטלית:
${signatureDataURL}

תאריך: ${new Date().toLocaleDateString()}

ליצירת קשר:
עידו שגב
טלפון: 054-7667775
אימייל: Triroars@gmail.com

בברכה,
עידו שגב
מנכ"ל TriRoars
    `;

    sendEmail('shimi.homerun@gmail.com', emailSubject, emailBody);
    hideSignaturePopup();
}

// הוספת מאזיני אירועים כשהדף נטען
document.addEventListener('DOMContentLoaded', addEventListeners);
