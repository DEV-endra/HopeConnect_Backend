-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_username_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "username" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
