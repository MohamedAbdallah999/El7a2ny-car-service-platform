-- Admin registration is now public and still protected by email verification.
ALTER TABLE "pending_registrations"
DROP CONSTRAINT "pending_registrations_admin_invitation_id_fkey";

ALTER TABLE "pending_registrations"
DROP COLUMN "admin_invitation_id";

DROP TABLE "admin_invitations";
