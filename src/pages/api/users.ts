import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper para manejar errores y extraer el mensaje.
 */
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Ocurrió un error desconocido';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name } = req.body;

        // Validación simple
        if (!name) {
            return res.status(400).json({ success: false, error: 'El nombre de usuario es requerido.' });
        }

        try {
            const user = await prisma.user.create({
                data: { name },
            });

            return res.status(201).json({ success: true, user });
        } catch (error) {
            // Manejo de error
            return res.status(500).json({ success: false, error: getErrorMessage(error) });
        }
    } else {
        return res.status(405).json({ message: 'Método no permitido' });
    }
}