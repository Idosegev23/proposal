// הוסף כאן את הפונט העברי בפורמט base64
const davidFont = '...'; // יש להחליף זאת עם המחרוזת base64 האמיתית של הפונט

// אתחול OAuth 2.0 Client
function initClient() {
    gapi.client.init({
        clientId: '773526387599-e7plamuuek9uobg1m4grf5ij30t7sfhg.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/gmail.send'
    }).then(() => {
        console.log('OAuth 2.0 Client initialized');
    }).catch(error => {
        console.error('Error initializing OAuth 2.0 Client:', error);
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
    document.getElementById('closePdfPreview')?.addEventListener('click', hidePdfPreview);
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

function hidePdfPreview() {
    document.getElementById('pdfPreviewPopup').style.display = 'none';
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

// פונקציה ליצירת PDF מההצעה עם החתימה
async function createPDF(proposalElement, signatureDataURL) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // הוספת הפונט העברי
    pdf.addFileToVFS('David-normal.ttf', davidFont);
    pdf.addFont('David-normal.ttf', 'David', 'normal');
    pdf.setFont('David');

    // קביעת גודל הדף
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    
    // יצירת צילום מסך של ההצעה
    const canvas = await html2canvas(proposalElement, {
        scale: 2,
        useCORS: true,
        logging: false
    });
    
    // המרת הקנבס לתמונה
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // חישוב יחס הגודל
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // הוספת התמונה לPDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // הוספת עמודים נוספים אם צריך
    if (imgHeight > pageHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        while (heightLeft >= 0) {
            position = heightLeft - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
    }
    
    // הוספת החתימה
    const signatureWidth = 60;
    const signatureHeight = 30;
    const signatureX = 20;
    const signatureY = pageHeight - 50;
    pdf.addImage(signatureDataURL, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
    
    // הוספת תאריך ושעה
    const now = new Date();
    const timestamp = `חתימה בתאריך: ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} בשעה: ${now.getHours()}:${now.getMinutes()}`;
    pdf.setFontSize(10);
    pdf.text(timestamp, 20, pageHeight - 15, { align: 'right' });

    return pdf;
}

// פונקציה להצגת ה-PDF
function previewPDF(pdfData) {
    const pdfPreviewElement = document.getElementById('pdfPreview');
    if (!pdfPreviewElement) {
        console.error('PDF preview element not found');
        return;
    }
    pdfPreviewElement.innerHTML = '';

    pdfjsLib.getDocument({data: pdfData}).promise.then(function(pdf) {
        pdf.getPage(1).then(function(page) {
            const scale = 1.5;
            const viewport = page.getViewport({scale: scale});

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);

            pdfPreviewElement.appendChild(canvas);
        });
    });

    document.getElementById('pdfPreviewPopup').style.display = 'block';
}

// פונקציה לשליחת המייל באמצעות Gmail API
async function sendEmail(from, to, subject, body, pdfBase64) {
    const accessToken = gapi.auth.getToken().access_token;
    const message = [
        'Content-Type: multipart/mixed; boundary="foo_bar_baz"\n',
        'MIME-Version: 1.0\n',
        `To: ${to}\n`,
        `From: ${from}\n`,
        `Subject: ${subject}\n\n`,

        '--foo_bar_baz\n',
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n\n',

        body,
        '\n\n',

        '--foo_bar_baz\n',
        'Content-Type: application/pdf\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: base64\n',
        'Content-Disposition: attachment; filename="proposal_signed.pdf"\n\n',

        pdfBase64,
        '\n\n',

        '--foo_bar_baz--'
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
async function handleSignatureSubmit() {
    const dataURL = canvas.toDataURL('image/png');
    const proposalElement = document.getElementById('proposalContainer');
    const pdf = await createPDF(proposalElement, dataURL);
    const pdfData = pdf.output('arraybuffer');

    previewPDF(pdfData);

    document.getElementById('sendEmailBtn').onclick = async function() {
        const pdfBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(pdfData)));
        const emailSubject = 'אישור הצעת מחיר';
        const emailBody = `
            הצעת מחיר לריטיינר חודשי
            עבור חברת Homerun
            
            ריטיינר חודשי: 5,000 ש"ח
            
            כל השינויים וההתאמות במסגרת השירותים הכלולים בריטיינר כלולים במחיר החודשי.
            
            פרויקטים נוספים או התאמות שאינם כלולים בשירותים המוצעים יהיו כרוכים בעלות נוספת.
            
            אנו מחויבים לשמירה על סודיות מלאה של המידע העסקי שלכם. כל החומרים שנוצרים במהלך העבודה יהיו בבעלותכם המלאה ולא ייעשה בהם שימוש אחר ללא אישורכם.
            
            חתימה דיגיטלית מצורפת בקובץ ה-PDF.
        `;

        await sendEmail('Triroars@gmail.com', 'shimi.homerun@gmail.com', emailSubject, emailBody, pdfBase64);
        document.getElementById('pdfPreviewPopup').style.display = 'none';
        document.getElementById('signaturePopup').style.display = 'none';
    };
}

// הוספת מאזיני אירועים כשהדף נטען
document.addEventListener('DOMContentLoaded', addEventListeners);
