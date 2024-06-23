// הצגת פופאפ החתימה כאשר לוחצים על כפתור החתימה
document.getElementById('signButton').addEventListener('click', function() {
    document.getElementById('signaturePopup').style.display = 'block';
});

// סגירת פופאפ החתימה כאשר לוחצים על כפתור הסגירה
document.getElementById('closePopup').addEventListener('click', function() {
    document.getElementById('signaturePopup').style.display = 'none';
});

// הגדרות ליצירת חתימה באמצעות העכבר
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => {
    drawing = true;
    ctx.beginPath();
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', draw);

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

// שליחה של ההצעה החתומה במייל לאחר החתימה
document.getElementById('submitSignature').addEventListener('click', function() {
    const dataURL = canvas.toDataURL('image/png');
    const emailSubject = 'אישור הצעת מחיר';
    const emailBody = `
        <h1>הצעת מחיר לריטיינר חודשי</h1>
        <h2>עבור חברת Homerun</h2>
        <p>ריטיינר חודשי: 5,000 ש"ח</p>
        <p>כל השינויים וההתאמות במסגרת השירותים הכלולים בריטיינר כלולים במחיר החודשי.</p>
        <p>פרויקטים נוספים או התאמות שאינם כלולים בשירותים המוצעים יהיו כרוכים בעלות נוספת.</p>
        <p>אנו מחויבים לשמירה על סודיות מלאה של המידע העסקי שלכם. כל החומרים שנוצרים במהלך העבודה יהיו בבעלותכם המלאה ולא ייעשה בהם שימוש אחר ללא אישורכם.</p>
        <p>חתימה דיגיטלית:</p>
        <img src="${dataURL}" alt="חתימה דיגיטלית" />
    `;

    // בניית הקישור לפתיחת ממשק שליחת המייל של Gmail עם הנתונים המלאים
    const mailtoLink = `mailto:Triroars@gmail.com,shimi.homerun@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // פתיחת הקישור ב-Gmail
    window.location.href = mailtoLink;

    // הסתרת פופאפ החתימה לאחר השליחה
    document.getElementById('signaturePopup').style.display = 'none';
});
