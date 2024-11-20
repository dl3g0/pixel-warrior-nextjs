import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

// Desactivar el body parser de Next.js para permitir trabajar con WebSockets
export const config = {
  api: {
    bodyParser: false, // Desactiva el body parser para manejar la conexión WebSocket
  },
};

// Extender el tipo de res.socket para incluir 'server' e 'io'
interface CustomSocket extends NodeJS.Socket {
  server: {
    io?: Server; // Propiedad opcional para evitar errores en tiempo de ejecución
  };
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  // Forzamos el tipo de res.socket para que incluya las propiedades esperadas
  const socket = (res.socket as unknown) as CustomSocket;

  if (!socket.server.io) {
    // Aquí usamos el servidor HTTP subyacente para inicializar Socket.IO
    const io = new Server(socket.server as any); // Pasar el servidor HTTP subyacente

    // Asignamos la instancia de io al servidor
    socket.server.io = io;

    // Configuración de eventos
    io.on('connection', (client) => {
      console.log('Un cliente se ha conectado');

      client.on('pixelChange', (data) => {
        console.log('Cambio de píxel:', data);
        client.broadcast.emit('pixelChange', data); // Emitir el cambio a otros clientes
      });

      client.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
      });
    });

    console.log('Servidor de socket.io ha sido inicializado');
  }

  // Finalizamos la respuesta sin necesidad de enviar nada
  res.end();
};

export default handler;
