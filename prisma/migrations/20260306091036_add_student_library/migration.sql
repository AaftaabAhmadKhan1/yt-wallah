-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentEmail" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "channelName" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressSeconds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WatchHistory_studentEmail_fkey" FOREIGN KEY ("studentEmail") REFERENCES "Student" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LikedVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentEmail" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "channelName" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "likedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LikedVideo_studentEmail_fkey" FOREIGN KEY ("studentEmail") REFERENCES "Student" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "WatchHistory_studentEmail_idx" ON "WatchHistory"("studentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_studentEmail_youtubeVideoId_key" ON "WatchHistory"("studentEmail", "youtubeVideoId");

-- CreateIndex
CREATE INDEX "LikedVideo_studentEmail_idx" ON "LikedVideo"("studentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "LikedVideo_studentEmail_youtubeVideoId_key" ON "LikedVideo"("studentEmail", "youtubeVideoId");
