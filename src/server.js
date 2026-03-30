import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or any SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password
  },
});

// Email sending endpoint
app.post('/send-invite', async (req, res) => {
  const { toEmail, noteTitle } = req.body;

  if (!toEmail || !noteTitle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Invitation to collaborate on "${noteTitle}"`,
    html: `
      <p>You have been invited to collaborate on a note titled "<b>${noteTitle}</b>".</p>
      <p>Click <a href="http://localhost:3000">here</a> to view and edit the note.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
