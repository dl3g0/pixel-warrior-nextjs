/*
  Warnings:

  - The primary key for the `Pixel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Pixel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[x,y]` on the table `Pixel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pixel" DROP CONSTRAINT "Pixel_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Pixel_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pixel_x_y_key" ON "Pixel"("x", "y");
