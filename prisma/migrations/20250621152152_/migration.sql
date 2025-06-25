-- AlterTable
ALTER TABLE `casketdetail` ADD COLUMN `image_url` VARCHAR(191) NULL,
    MODIFY `casketType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `flowerdetail` ADD COLUMN `image_url` VARCHAR(191) NULL,
    MODIFY `flowerType` VARCHAR(191) NULL;
