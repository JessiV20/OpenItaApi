const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');

app.use(cors()); 
app.use(express.json()); 
const filePath = path.join(__dirname, 'usuarios.json'); 
app.post('/api/enviar-correo', (req, res) => {
  const { nombre, correo, asunto, mensaje, imagen } = req.body;
  
  if (!imagen) {
    console.error('No se recibió la imagen en el servidor');
    return res.status(400).json({ error: 'No se recibió la imagen' });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Servidor SMTP de Outlook 365
    port: 587, // Puerto seguro para Outlook
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: 'editec_soporte@aguascalientes.tecnm.mx', // Tu dirección de Outlook 365
      pass: 'Mielsanmarcos24.' // Tu contraseña o contraseña de aplicación
    },
    tls: {
      ciphers: 'SSLv3' // A veces necesario para Outlook
    }
  });

  // Opciones del correo
  const mailOptions = {
    from: 'editec_soporte@aguascalientes.tecnm.mx',
    to: correo,
    subject: asunto,
    html: `
      <p>${mensaje}</p>
      <p>Adjunto encontrarás tu tarjeta de presentación.</p>
    `,
    attachments: [
      {
        filename: 'tarjeta.png',
        content: imagen,
        encoding: 'base64',
      },
    ],
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error completo al enviar correo:', {
        error: error.toString(),
        stack: error.stack,
        response: error.response
      });
      return res.status(500).json({ 
        error: 'Error al enviar el correo',
        details: error.toString() 
      });
    }
    console.log('Correo enviado con éxito:', info.response);
    res.status(200).json({ 
      message: 'Correo enviado exitosamente',
      info: info.response 
    });
  });
});

app.post('/api/guardar-datos', (req, res) => {
  const nuevoUsuario = req.body;

  // Leer el archivo usuarios.json
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo' });
    }

    const usuariosData = JSON.parse(data); // Convertir el contenido del archivo a JSON

    const correoExistente = usuariosData.usuarios.find(usuario => usuario.correo === nuevoUsuario.correo);

    if (correoExistente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

   
    const nuevoId = usuariosData.usuarios.length > 0 ? usuariosData.usuarios[usuariosData.usuarios.length - 1].usuario + 1 : 1;
    

    const usuarioConId = {
      usuario: nuevoId,
      ...nuevoUsuario
    };

    usuariosData.usuarios.push(usuarioConId); // Agregar el nuevo usuario

  
    fs.writeFile(filePath, JSON.stringify(usuariosData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar los datos' });
      }
      res.status(200).json({ message: 'Datos guardados correctamente', usuario: usuarioConId });
    });
  });
});


const port = 4300 || 5000;
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
