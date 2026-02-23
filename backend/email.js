const nodemailer = require('nodemailer');

// Configurazione SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true per porta 465, false per altre
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verifica connessione SMTP all'avvio
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
    console.log('⚠️  Email features disabled. Configure SMTP in .env file.');
  } else {
    console.log('✅ SMTP server ready to send emails');
  }
});

/**
 * Invia email di verifica account
 * @param {string} email - Email destinatario
 * @param {string} token - Token di verifica
 * @param {string} fullName - Nome completo utente
 */
async function sendVerificationEmail(email, token, fullName) {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/pages/verify-email.html?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'SPLit8'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: '✅ Verifica il tuo account SPLit8',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #233d5a; }
          .header { background: linear-gradient(135deg, #233d5a 0%, #56b4ff 100%); padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; color: #fff; font-size: 28px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #56b4ff; margin-top: 0; }
          .content p { line-height: 1.6; color: #b0b0b0; margin: 16px 0; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #56b4ff, #233d5a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .btn:hover { opacity: 0.9; }
          .footer { padding: 20px 30px; background: #0a0a0a; border-top: 1px solid #233d5a; text-align: center; color: #666; font-size: 12px; }
          .code { background: #1a1a1a; padding: 12px; border-radius: 6px; font-family: monospace; color: #56b4ff; margin: 16px 0; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Benvenuto in SPLit8!</h1>
          </div>
          <div class="content">
            <h2>Ciao ${fullName},</h2>
            <p>Grazie per esserti registrato su SPLit8, la piattaforma che connette professionisti e aziende.</p>
            <p>Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="btn">Verifica Account</a>
            </div>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <div class="code">${verifyUrl}</div>
            <p><strong>⏱️ Questo link scadrà tra 24 ore.</strong></p>
            <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SPLit8. Tutti i diritti riservati.</p>
            <p>Hai bisogno di aiuto? <a href="${process.env.APP_URL || 'http://localhost:5173'}/pages/contact.html" style="color: #56b4ff;">Contattaci</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Ciao ${fullName},

Benvenuto in SPLit8!

Per verificare il tuo account, visita questo link:
${verifyUrl}

Questo link scadrà tra 24 ore.

Se non hai richiesto questa registrazione, ignora questa email.

© ${new Date().getFullYear()} SPLit8
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Impossibile inviare email di verifica');
  }
}

/**
 * Invia email di reset password
 * @param {string} email - Email destinatario
 * @param {string} token - Token di reset
 * @param {string} fullName - Nome completo utente
 */
async function sendPasswordResetEmail(email, token, fullName) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/pages/reset-password.html?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'SPLit8'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Reset Password - SPLit8',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #233d5a; }
          .header { background: linear-gradient(135deg, #233d5a 0%, #56b4ff 100%); padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; color: #fff; font-size: 28px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #56b4ff; margin-top: 0; }
          .content p { line-height: 1.6; color: #b0b0b0; margin: 16px 0; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #56b4ff, #233d5a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .btn:hover { opacity: 0.9; }
          .footer { padding: 20px 30px; background: #0a0a0a; border-top: 1px solid #233d5a; text-align: center; color: #666; font-size: 12px; }
          .code { background: #1a1a1a; padding: 12px; border-radius: 6px; font-family: monospace; color: #56b4ff; margin: 16px 0; display: inline-block; }
          .warning { background: rgba(255, 184, 0, 0.1); border-left: 4px solid #FFB800; padding: 12px; margin: 16px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
          </div>
          <div class="content">
            <h2>Ciao ${fullName},</h2>
            <p>Hai richiesto il reset della tua password su SPLit8.</p>
            <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reimposta Password</a>
            </div>
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <div class="code">${resetUrl}</div>
            <div class="warning">
              <strong>⏱️ Questo link scadrà tra 1 ora.</strong><br>
              Per motivi di sicurezza, dovrai richiedere un nuovo link se scade.
            </div>
            <p><strong>⚠️ Non hai richiesto il reset?</strong><br>
            Se non sei stato tu a richiedere il reset della password, ignora questa email. La tua password attuale rimarrà invariata.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SPLit8. Tutti i diritti riservati.</p>
            <p>Hai bisogno di aiuto? <a href="${process.env.APP_URL || 'http://localhost:5173'}/pages/contact.html" style="color: #56b4ff;">Contattaci</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Ciao ${fullName},

Hai richiesto il reset della tua password su SPLit8.

Per reimpostare la password, visita questo link:
${resetUrl}

⚠️ IMPORTANTE: Questo link scadrà tra 1 ora.

Se non hai richiesto il reset, ignora questa email.

© ${new Date().getFullYear()} SPLit8
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending reset email:', error);
    throw new Error('Impossibile inviare email di reset');
  }
}

/**
 * Invia email di benvenuto dopo verifica
 * @param {string} email - Email destinatario
 * @param {string} fullName - Nome completo utente
 */
async function sendWelcomeEmail(email, fullName) {
  const dashboardUrl = `${process.env.APP_URL || 'http://localhost:5173'}/pages/dashboard.html`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'SPLit8'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: '🎊 Account Verificato - Benvenuto in SPLit8!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #233d5a; }
          .header { background: linear-gradient(135deg, #233d5a 0%, #56b4ff 100%); padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; color: #fff; font-size: 28px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #56b4ff; margin-top: 0; }
          .content p { line-height: 1.6; color: #b0b0b0; margin: 16px 0; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #56b4ff, #233d5a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .steps { background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .steps li { margin: 12px 0; color: #b0b0b0; }
          .footer { padding: 20px 30px; background: #0a0a0a; border-top: 1px solid #233d5a; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Account Attivato!</h1>
          </div>
          <div class="content">
            <h2>Benvenuto ${fullName}!</h2>
            <p>Il tuo account SPLit8 è stato verificato con successo. Ora puoi accedere a tutte le funzionalità della piattaforma.</p>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="btn">Vai alla Dashboard</a>
            </div>
            <div class="steps">
              <h3 style="color: #56b4ff; margin-top: 0;">✨ Prossimi passi:</h3>
              <ol>
                <li>Completa il tuo profilo con skills e specializzazioni</li>
                <li>Esplora i progetti disponibili nella tua zona</li>
                <li>Connettiti con altri professionisti</li>
                <li>Inizia a candidarti per i progetti</li>
              </ol>
            </div>
            <p>Buon lavoro con SPLit8! 🚀</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SPLit8. Tutti i diritti riservati.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️  Error sending welcome email:', error);
    // Non bloccare se email di benvenuto fallisce
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
