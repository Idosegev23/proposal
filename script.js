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
    // שמירת החתימה כתמונה ב-Base64
    const dataURL = canvas.toDataURL('image/png');
    
    // יצירת אובייקט File מהנתונים
    const file = new File([dataURLToBlob(dataURL)], 'signature.png', { type: 'image/png' });

    // הגדרת פרטי המייל
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

    // שימוש ב-FormData לשליחת הקובץ והנתונים
    const formData = new FormData();
    formData.append('from', 'Triroars@gmail.com');
    formData.append('to', 'Triroars@gmail.com, shimi.homerun@gmail.com');
    formData.append('subject', emailSubject);
    formData.append('html', emailBody);
    formData.append('attachments', file);

    // שליחה של הנתונים לשרת דואר (כאן נדרש API או שרת שיטפל בבקשה)
    fetch('https://your-server-endpoint/send-email', {
        method: 'POST',
        body: formData,
    }).then(response => response.json())
      .then(result => {
          console.log('Email sent:', result);
      }).catch(error => {
          console.error('Error sending email:', error);
      });

    // הסתרת פופאפ החתימה לאחר השליחה
    document.getElementById('signaturePopup').style.display = 'none';
});

// פונקציה להמרת Base64 ל-Blob
function dataURLToBlob(dataURL) {
    const binary = atob(dataURL.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/png' });
}
