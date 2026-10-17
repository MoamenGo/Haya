-- The Dutch plan (A1 → C1) joins the built-in study plans (ADR-004).
-- Only the allowed keys change; rows are created by the app.
alter table public.learning_paths drop constraint learning_paths_curriculum_key_check;
alter table public.learning_paths add constraint learning_paths_curriculum_key_check
  check (
    curriculum_key in ('english_a2_c1', 'health_tech', 'dutch_a1_c1')
    or curriculum_key ~ '^custom:[0-9a-f-]{36}$'
  );
