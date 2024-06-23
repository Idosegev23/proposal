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
    // שמירת החתימה כתמונה
    const dataURL = canvas.toDataURL('image/png');

    // יצירת קישור לשמירת התמונה באופן זמני
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'signature.png';
    link.click();

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

    // שימוש ב-Gmail API לשליחת המייל
    sendEmail('Triroars@gmail.com', 'shimi.homerun@gmail.com', emailSubject, emailBody, dataURL);

    // הסתרת פופאפ החתימה לאחר השליחה
    document.getElementById('signaturePopup').style.display = 'none';
});

async function sendEmail(from, to, subject, body, signatureDataURL) {
    // פרטי OAuth2 שלך
    const clientId = '773526387599-e7plamuuek9uobg1m4grf5ij30t7sfhg.apps.googleusercontent.com';
    const clientSecret = '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';
    const refreshToken = '1//03UCWOVTdiT2JCgYIARAAGAMSNwF-L9IrgSTrMW6iKB_kUgAzhtxBgD-I7kB78_wbAMm73OHj2BgmO4rjrWV_wSrvLEeOmIjpTw0';

    // הגדרת ה-client OAuth2
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    try {
        // קבלת access token
        const accessToken = await oAuth2Client.getAccessToken();

        // קביעת הטרנספורטר של Nodemailer
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: from,
                clientId,
                clientSecret,
                refreshToken,
                accessToken: accessToken.token,
            },
        });

        // קביעת אפשרויות המייל
        const mailOptions = {
            from,
            to,
            subject,
            html: body,
            attachments: [
                {
                    filename: 'signature.png',
                    content: signatureDataURL.split('base64,')[1],
                    encoding: 'base64'
                }
            ]
        };

        // שליחת המייל
        const result = await transport.sendMail(mailOptions);
        console.log('Email sent:', result);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
