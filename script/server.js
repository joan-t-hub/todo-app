const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou autre service SMTP
  auth: {
    user: 'VOTRE_EMAIL@gmail.com',
    pass: 'VOTRE_MOT_DE_PASSE_OU_APP_PASSWORD'
  }
});

app.post('/send-todos', async (req, res) => {
  const { email, json } = req.body;
  try {
    await transporter.sendMail({
      from: '"Todo App" <VOTRE_EMAIL@gmail.com>',
      to: email,
      subject: 'Vos to-dos',
      text: 'Voici vos to-dos au format JSON :\n\n' + json,
      attachments: [
        {
          filename: 'todos.json',
          content: json
        }
      ]
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Serveur backend démarré sur http://localhost:' + PORT);
});