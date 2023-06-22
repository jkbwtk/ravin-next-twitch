-- CreateEnum
CREATE TYPE "ChannelActionType" AS ENUM ('ban', 'timeout', 'delete');

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "joined" BOOLEAN NOT NULL DEFAULT false,
    "chantingSettings" JSON NOT NULL DEFAULT '{"enabled":false,"interval":60,"length":3}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelAction" (
    "id" SERIAL NOT NULL,
    "issuerDisplayName" VARCHAR NOT NULL,
    "targetDisplayName" VARCHAR NOT NULL,
    "type" "ChannelActionType" NOT NULL,
    "data" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),
    "channelUserId" VARCHAR NOT NULL,

    CONSTRAINT "ChannelAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelStats" (
    "id" SERIAL NOT NULL,
    "frameId" INTEGER NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "timeouts" INTEGER NOT NULL DEFAULT 0,
    "bans" INTEGER NOT NULL DEFAULT 0,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "commands" INTEGER NOT NULL DEFAULT 0,
    "frameDuration" INTEGER NOT NULL DEFAULT 60000,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "ChannelStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "command" VARCHAR NOT NULL,
    "response" VARCHAR NOT NULL,
    "userLevel" INTEGER NOT NULL DEFAULT 0,
    "cooldown" INTEGER NOT NULL DEFAULT 10,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destroyedAt" TIMESTAMPTZ(6),
    "channelUserId" VARCHAR NOT NULL,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "key" VARCHAR(32) NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destroyedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "channelName" VARCHAR NOT NULL,
    "username" VARCHAR NOT NULL,
    "displayName" VARCHAR NOT NULL,
    "color" VARCHAR,
    "userId" VARCHAR NOT NULL,
    "content" VARCHAR NOT NULL,
    "emotes" JSONB,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "badgeInfo" JSONB,
    "badges" JSONB,
    "flags" VARCHAR,
    "messageType" VARCHAR NOT NULL,
    "firstMessage" BOOLEAN NOT NULL,
    "mod" BOOLEAN NOT NULL,
    "subscriber" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),
    "channelUserId" VARCHAR NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemNotification" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "content" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "SystemNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "accessToken" VARCHAR NOT NULL,
    "refreshToken" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR NOT NULL,
    "login" VARCHAR NOT NULL,
    "displayName" VARCHAR NOT NULL,
    "email" VARCHAR,
    "profileImageUrl" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userId_key" ON "Channel"("userId");

-- CreateIndex
CREATE INDEX "Channel_userId_idx" ON "Channel"("userId");

-- CreateIndex
CREATE INDEX "ChannelAction_targetDisplayName_idx" ON "ChannelAction"("targetDisplayName");

-- CreateIndex
CREATE INDEX "ChannelAction_channelUserId_idx" ON "ChannelAction"("channelUserId");

-- CreateIndex
CREATE INDEX "ChannelAction_type_idx" ON "ChannelAction"("type");

-- CreateIndex
CREATE INDEX "ChannelAction_issuerDisplayName_idx" ON "ChannelAction"("issuerDisplayName");

-- CreateIndex
CREATE INDEX "ChannelStats_userId_idx" ON "ChannelStats"("userId");

-- CreateIndex
CREATE INDEX "ChannelStats_frameId_idx" ON "ChannelStats"("frameId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelStats_userId_frameId_key" ON "ChannelStats"("userId", "frameId");

-- CreateIndex
CREATE INDEX "Command_channelUserId_idx" ON "Command"("channelUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Command_channelUserId_command_key" ON "Command"("channelUserId", "command");

-- CreateIndex
CREATE INDEX "Message_uuid_idx" ON "Message"("uuid");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Message_channelUserId_idx" ON "Message"("channelUserId");

-- CreateIndex
CREATE INDEX "Message_username_idx" ON "Message"("username");

-- CreateIndex
CREATE INDEX "Message_channelName_idx" ON "Message"("channelName");

-- CreateIndex
CREATE INDEX "SystemNotification_userId_idx" ON "SystemNotification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_refreshToken_key" ON "Token"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_key" ON "Token"("userId");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_displayName_key" ON "User"("displayName");

-- CreateIndex
CREATE INDEX "User_login_idx" ON "User"("login");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChannelAction" ADD CONSTRAINT "ChannelAction_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChannelStats" ADD CONSTRAINT "ChannelStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SystemNotification" ADD CONSTRAINT "SystemNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
