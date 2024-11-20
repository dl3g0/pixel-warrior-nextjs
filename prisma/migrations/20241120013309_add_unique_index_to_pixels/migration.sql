/*
  Warnings:

  - A unique constraint covering the columns `[x,y]` on the table `Pixel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pixel_x_y_key" ON "Pixel"("x", "y");
