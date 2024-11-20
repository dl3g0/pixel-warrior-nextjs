import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

const io = new Server(3000);

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('pixelChange', async (data) => {
        try {
            const { x, y, color, userId } = data;
    
            // Usar el índice compuesto [x, y] para encontrar el píxel
            await prisma.pixel.upsert({
                where: {
                    // Usar el índice compuesto, no el 'id'
                    x_y: {
                        x: x,
                        y: y,
                    },
                },
                update: {
                    color,
                    userId
                },
                create: {
                    x,
                    y,
                    color,
                    userId,
                },
            });
    
            // Emitir el cambio de píxel a todos los clientes conectados
            io.emit('pixelChange', data);
        } catch (err) {
            console.error('Error al guardar el píxel:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});
