const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');

// טען את הקובץ credentials שלך
const credentials = JSON.parse(fs.readFileSync('path/to/credentials.json'));

// הוסף את ה-credentials שלך
const { client_secret, client_id, redirect_uris } = credentials.installed;

// צור OAuth2 client
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// הגדר את ה-access token שלך
oAuth2Client.setCredentials({ refresh_token: 'YOUR_REFRESH_TOKEN' });

async function sendEmail() {
    try {
        // צור אובייקט access token
        const accessToken = await oAuth2Client.getAccessToken();

        // צור את הטרנספורטר של nodemailer
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'triroars@gmail.com',
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: 'YOUR_REFRESH_TOKEN',
                accessToken: accessToken,
            },
        });

        // הגדרות המייל
        const mailOptions = {
            from: 'Triroars@gmail.com',
            to: 'triroars@gmail.com, shimi.homerun@gmail.com',
            subject: 'אישור הצעת מחיר',
            html: `
                <h1>הצעת מחיר לריטיינר חודשי</h1>
                <h2>עבור חברת Homerun</h2>
                <p>ריטיינר חודשי: 5,000 ש"ח</p>
                <p>כל השינויים וההתאמות במסגרת השירותים הכלולים בריטיינר כלולים במחיר החודשי.</p>
                <p>פרויקטים נוספים או התאמות שאינם כלולים בשירותים המוצעים יהיו כרוכים בעלות נוספת.</p>
                <p>אנו מחויבים לשמירה על סודיות מלאה של המידע העסקי שלכם. כל החומרים שנוצרים במהלך העבודה יהיו בבעלותכם המלאה ולא ייעשה בהם שימוש אחר ללא אישורכם.</p>
                <p>חתימה דיגיטלית:</p>
                <img src="cid:signatureImage" alt="חתימה דיגיטלית" />
            `,
            attachments: [
                {
                    filename: 'signature.png',
                    path: 'path/to/saved/signature.png',
                    cid: 'signatureImage' // שימוש ב-content id כדי להוסיף את התמונה במייל
                }
            ]
        };

        // שלח את המייל
        const result = await transport.sendMail(mailOptions);
        console.log('Email sent:', result);
    } catch (error) {
        console.log('Error sending email:', error);
    }
}

sendEmail();
