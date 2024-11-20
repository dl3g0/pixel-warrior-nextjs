import express from 'express';
import http from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  
  // Configura CORS para permitir solicitudes desde tu dominio frontend
  const io = new Server(httpServer, {
    cors: {
      origin: "*",  // Permite todas las solicitudes de cualquier origen
      methods: ["GET", "POST"],
      credentials: true,  // Si necesitas enviar cookies o cabeceras de autenticación
    },
  });

  // Escuchar conexiones de WebSocket
  io.on('connection', async (socket) => {
    console.log('Un usuario se ha conectado');

    // Obtener datos iniciales del lienzo desde la base de datos
    try {
      const pixels = await prisma.pixel.findMany({
        select: { x: true, y: true, color: true },
      });

      const rows = 100; // Ajusta al tamaño de tu lienzo
      const cols = 100;
      const canvas = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => '#FFFFFF') // Color por defecto
      );

      // Asignar colores desde la base de datos
      pixels.forEach(({ x, y, color }) => {
        canvas[y][x] = color; // Nota: y -> fila, x -> columna
      });

      // Emitir datos iniciales del lienzo al cliente
      socket.emit('canvasData', canvas);
    } catch (error) {
      console.error('Error obteniendo datos del lienzo:', error);
    }

    // Evento para cuando el servidor recibe un cambio en el píxel
    socket.on('pixelChange', async (data) => {
      const { x, y, color } = data;
    
      try {
        // Actualizar o crear el píxel en la base de datos
        await prisma.pixel.upsert({
          where: {
            x_y: { // Clave compuesta utilizando el índice único
              x,
              y,
            },
          },
          update: { color }, // Actualiza solo el color
          create: { x, y, color }, // Crea el píxel si no existe
        });
    
        console.log(`Píxel actualizado: (${x}, ${y}) -> ${color}`);
    
        // Emitir el cambio a todos los clientes
        io.emit('pixelChange', { x, y, color });
      } catch (error) {
        console.error('Error actualizando el píxel:', error);
      }
    });

    // Emitir el número de usuarios conectados
    io.emit('userCount', io.engine.clientsCount);

    // Limpiar cuando el cliente se desconecta
    socket.on('disconnect', () => {
      console.log('Un usuario se ha desconectado');
      io.emit('userCount', io.engine.clientsCount); // Actualizar el número de usuarios
    });
  });

  // Maneja las rutas de Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });

  // Manejo de errores explícito
  httpServer.on('error', (err) => {
    console.error('Error en el servidor:', err);
  });
});
