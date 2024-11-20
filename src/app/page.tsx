'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const IndexPage: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [canvasData, setCanvasData] = useState<string[][]>([]);

  const canvasSize = 600; // Tamaño total del lienzo (600x600 px)
  const gridSize = 100; // Cantidad de píxeles por fila/columna (100x100)
  const pixelSize = canvasSize / gridSize; // Tamaño de cada píxel (6x6 px)

  useEffect(() => {
    const socketConnection = io('https://pixel-warrior-nextjs.onrender.com:3000');
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log('Conectado al servidor de WebSocket');
    });

    socketConnection.on('canvasData', (data: string[][]) => {
      console.log(data)
      setCanvasData(data);
    });

    socketConnection.on('pixelChange', (data: { x: number; y: number; color: string }) => {
      setCanvasData((prevCanvasData) => {
        const newCanvasData = [...prevCanvasData];
        newCanvasData[data.y][data.x] = data.color;
        return newCanvasData;
      });
    });

    socketConnection.on('userCount', (count: number) => {
      setUserCount(count);
    });

    return () => {
      socketConnection.off('canvasData');
      socketConnection.off('pixelChange');
      socketConnection.off('userCount');
    };
  }, []);

  useEffect(() => {
    async function fetchCanvasData() {
      try {
        const response = await fetch('/api/canvas');
        const data = await response.json();
        setCanvasData(data);
      } catch (error) {
        console.error('Error al obtener los datos del lienzo:', error);
      }
    }

    fetchCanvasData();
  }, []);

  const handlePixelClick = (x: number, y: number, color: string) => {
    if (socket) {
      socket.emit('pixelChange', { x, y, color });
    }
  };

  return (
    <div>
      <h1>Guerra de Píxeles</h1>
      <div>Usuarios conectados: {userCount}</div>
      <div
        id="canvas"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`,
          width: `${canvasSize}px`,
          height: `${canvasSize}px`,
        }}
      >
        {canvasData.map((row, y) =>
          row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                backgroundColor: color || '#ffffff',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
              onClick={() => handlePixelClick(x, y, '#FF0000')}
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default IndexPage;
