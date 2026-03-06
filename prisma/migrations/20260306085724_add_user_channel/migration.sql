-- CreateTable
CREATE TABLE "UserChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "youtubeChannelId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "subscriberCount" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "UserChannel_userEmail_idx" ON "UserChannel"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannel_userEmail_youtubeChannelId_key" ON "UserChannel"("userEmail", "youtubeChannelId");
