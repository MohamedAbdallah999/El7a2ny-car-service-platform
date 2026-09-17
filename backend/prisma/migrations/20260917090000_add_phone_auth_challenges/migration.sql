CREATE TYPE "AuthChallengeType" AS ENUM ('PRIVILEGED_LOGIN');

CREATE TABLE "admin_invitations" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_invitations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pending_registrations" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL,
    "admin_invitation_id" UUID,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "login_challenges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "type" "AuthChallengeType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_invitations_email_key" ON "admin_invitations"("email");
CREATE UNIQUE INDEX "admin_invitations_phone_key" ON "admin_invitations"("phone");
CREATE UNIQUE INDEX "admin_invitations_token_hash_key" ON "admin_invitations"("token_hash");
CREATE INDEX "admin_invitations_expires_at_idx" ON "admin_invitations"("expires_at");
CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");
CREATE UNIQUE INDEX "pending_registrations_phone_key" ON "pending_registrations"("phone");
CREATE UNIQUE INDEX "pending_registrations_admin_invitation_id_key" ON "pending_registrations"("admin_invitation_id");
CREATE INDEX "pending_registrations_expires_at_idx" ON "pending_registrations"("expires_at");
CREATE UNIQUE INDEX "login_challenges_token_hash_key" ON "login_challenges"("token_hash");
CREATE INDEX "login_challenges_user_id_idx" ON "login_challenges"("user_id");
CREATE INDEX "login_challenges_expires_at_idx" ON "login_challenges"("expires_at");

ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pending_registrations" ADD CONSTRAINT "pending_registrations_admin_invitation_id_fkey" FOREIGN KEY ("admin_invitation_id") REFERENCES "admin_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "login_challenges" ADD CONSTRAINT "login_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
