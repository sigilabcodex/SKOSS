CREATE TABLE IF NOT EXISTS "workspace" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "timezone" text NOT NULL,
  "default_production_cutoff_hour" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_preferences" (
  "workspace_id" text PRIMARY KEY NOT NULL,
  "locale" text NOT NULL,
  "preset" text NOT NULL,
  "operating_mode" text NOT NULL,
  "theme" text NOT NULL,
  "onboarding_completed" boolean NOT NULL,
  "completed_at" text,
  "updated_at" text,
  CONSTRAINT "workspace_preferences_workspace_id_workspace_id_fk"
    FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "instance_state" (
  "id" text PRIMARY KEY NOT NULL,
  "initialized" boolean NOT NULL,
  "onboarding_status" text NOT NULL,
  "demo_mode_active" boolean NOT NULL,
  "environment_type" text NOT NULL,
  "backup_hint_available" boolean NOT NULL,
  "last_restore_at" text,
  "onboarding_progress" jsonb NOT NULL,
  "operator_onboarding_by_user_id" jsonb,
  "module_states" jsonb
);

CREATE TABLE IF NOT EXISTS "session_state" (
  "id" text PRIMARY KEY NOT NULL,
  "current_user_id" text,
  "last_login_at" text
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "display_name" text NOT NULL,
  "username" text,
  "login_identifier" text NOT NULL,
  "password_hash" text NOT NULL,
  "password_updated_at" text,
  "must_change_password" boolean NOT NULL,
  "role" text NOT NULL,
  "workspace_id" text NOT NULL,
  "default_workspace" text,
  "email" text,
  "phone" text,
  "active" boolean NOT NULL,
  "preferences" jsonb,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  CONSTRAINT "users_workspace_id_workspace_id_fk"
    FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" text NOT NULL,
  "role" text NOT NULL,
  CONSTRAINT "user_roles_user_id_role_pk" PRIMARY KEY("user_id","role"),
  CONSTRAINT "user_roles_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "customers" (
  "id" text PRIMARY KEY NOT NULL,
  "display_name" text NOT NULL,
  "phone" text,
  "email" text,
  "preferred_contact_method" text,
  "address" text,
  "delivery_note" text,
  "internal_note" text,
  "active" boolean NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  "created_by_user_id" text,
  "updated_by_user_id" text
);
