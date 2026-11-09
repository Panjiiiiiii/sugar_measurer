/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `push_subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `push_subscription_user_id_key` ON `push_subscription`(`user_id`);
