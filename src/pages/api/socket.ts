import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

// Desactivar el body parser de Next.js para permitir trabajar con WebSockets
export const config = {
  api: {
    bodyParser: false, // Desactiva el body parser para manejar la conexión WebSocket
  },
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    // Si no existe la propiedad 'io', creamos una instancia de Socket.IO
    const io = new Server(res.socket.server);

    // Asignamos la instancia de io al servidor de Next.js
    res.socket.server.io = io;

    // Configuración de los eventos de socket.io
    io.on('connection', (socket) => {
      console.log('Un cliente se ha conectado');

      socket.on('pixelChange', (data) => {
        console.log('Cambio de píxel:', data);
        socket.broadcast.emit('pixelChange', data); // Emitir el cambio a los demás clientes
      });

      socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
      });
    });

    console.log('Servidor de socket.io ha sido inicializado');
  }

  // Finalizamos la respuesta sin necesidad de enviar nada
  res.end();
};

export default handler;
