-- daily-log-app :: initial schema
-- PostgreSQL (Neon). Run with: psql "$DATABASE_URL" -f migrations/001_init.sql
--
-- Hierarchy:
--   users ─┐
--          └─ daily_logs (one row per user per day)
--                ├─ meals ── food_items        (nutrition / macros)
--                ├─ peds_taken                 (compounds logged)
--                ├─ training_sessions ── exercises ── sets
--                └─ notes

BEGIN;

-- Auth: simple PIN/password. Not in the original 8-table list, but required
-- so logs belong to someone and sync across devices.
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      TEXT        NOT NULL UNIQUE,
    pin_hash      TEXT        NOT NULL,          -- store a hash, never the raw PIN
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_logs (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date      DATE        NOT NULL,
    bodyweight    NUMERIC(6,2),                  -- optional daily weigh-in
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);

-- ── Nutrition ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    daily_log_id  BIGINT      NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    name          TEXT        NOT NULL,          -- "Breakfast", "Meal 2", ...
    sort_order    INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_items (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meal_id       BIGINT      NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    name          TEXT        NOT NULL,
    quantity      NUMERIC(8,2) NOT NULL DEFAULT 1,
    unit          TEXT        NOT NULL DEFAULT 'serving',
    calories      NUMERIC(8,2) NOT NULL DEFAULT 0,
    protein_g     NUMERIC(8,2) NOT NULL DEFAULT 0,
    carbs_g       NUMERIC(8,2) NOT NULL DEFAULT 0,
    fat_g         NUMERIC(8,2) NOT NULL DEFAULT 0,
    sort_order    INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PEDs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS peds_taken (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    daily_log_id  BIGINT      NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    compound      TEXT        NOT NULL,          -- e.g. "Testosterone Enanthate"
    dose          NUMERIC(8,2),
    unit          TEXT        NOT NULL DEFAULT 'mg',
    route         TEXT,                          -- "injection", "oral", "transdermal"
    taken_at      TIMESTAMPTZ,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Training ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_sessions (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    daily_log_id  BIGINT      NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    name          TEXT        NOT NULL DEFAULT 'Workout',  -- "Push", "Legs", ...
    started_at    TIMESTAMPTZ,
    duration_min  INT,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    training_session_id BIGINT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    name                TEXT   NOT NULL,
    muscle_group        TEXT,
    sort_order          INT    NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sets (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exercise_id   BIGINT      NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number    INT         NOT NULL DEFAULT 1,
    reps          INT,
    weight        NUMERIC(7,2),
    weight_unit   TEXT        NOT NULL DEFAULT 'kg',
    rpe           NUMERIC(3,1),                  -- rate of perceived exertion 0-10
    is_warmup     BOOLEAN     NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Notes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    daily_log_id  BIGINT      NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    content       TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes for the common access patterns ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date  ON daily_logs (user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_daily_log        ON meals (daily_log_id);
CREATE INDEX IF NOT EXISTS idx_food_items_meal        ON food_items (meal_id);
CREATE INDEX IF NOT EXISTS idx_peds_daily_log         ON peds_taken (daily_log_id);
CREATE INDEX IF NOT EXISTS idx_sessions_daily_log     ON training_sessions (daily_log_id);
CREATE INDEX IF NOT EXISTS idx_exercises_session      ON exercises (training_session_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise          ON sets (exercise_id);
CREATE INDEX IF NOT EXISTS idx_notes_daily_log        ON notes (daily_log_id);

COMMIT;
