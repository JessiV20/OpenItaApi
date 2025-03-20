const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors()); // Habilita CORS
app.use(express.json()); // Para parsear el cuerpo de la solicitud

const filePath = path.join(__dirname, 'usuarios.json'); // Ruta del archivo JSON

// Ruta para guardar los datos del formulario
app.post('/api/guardar-datos', (req, res) => {
  const nuevoUsuario = req.body;

  // Leer el archivo usuarios.json
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error al leer el archivo' });
    }

    const usuariosData = JSON.parse(data); // Convertir el contenido del archivo a JSON

    // Verificar si el correo ya está registrado
    const correoExistente = usuariosData.usuarios.find(usuario => usuario.correo === nuevoUsuario.correo);

    if (correoExistente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Obtener el último ID de usuario registrado y sumar 1
    const nuevoId = usuariosData.usuarios.length > 0 ? usuariosData.usuarios[usuariosData.usuarios.length - 1].usuario + 1 : 1;
    
    // Asignar el nuevo ID de usuario y agregar al array de usuarios
    const usuarioConId = {
      usuario: nuevoId,
      ...nuevoUsuario
    };

    usuariosData.usuarios.push(usuarioConId); // Agregar el nuevo usuario

    // Escribir los datos actualizados en el archivo JSON
    fs.writeFile(filePath, JSON.stringify(usuariosData, null, 2), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar los datos' });
      }
      res.status(200).json({ message: 'Datos guardados correctamente', usuario: usuarioConId });
    });
  });
});

// Iniciar el servidor
const port = 4300;
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
