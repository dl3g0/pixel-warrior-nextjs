import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Consultar los datos del lienzo desde la base de datos
      const pixels = await prisma.pixel.findMany({
        select: {
          x: true,
          y: true,
          color: true,
        },
      });

      // Crear una matriz 10x10 y llenarla con los datos recuperados
      const rows = 100;
      const cols = 100;
      const canvas: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => '#FFFFFF') // Color por defecto (blanco)
      );

      // Asignar los colores recuperados a la matriz
      pixels.forEach(({ x, y, color }) => {
        canvas[y][x] = color; // Notar que "y" es la fila e "x" es la columna
      });
      console.log(canvas)
      res.status(200).json(canvas); // Devolver el lienzo como JSON
    } catch (error) {
      console.error('Error recuperando los datos del lienzo:', error);
      res.status(500).json({ error: 'Error recuperando los datos del lienzo' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

