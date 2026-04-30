-- Two-phase submission tracking.
--
-- Submissions are now created when the respondent dismisses the welcome screen
-- (a "draft" with started_at set, completed_at null, answers '{}') and updated
-- progressively as they advance. The final advance sets completed_at via the
-- same RPC. This makes per-question drop-off analytics meaningful and stops
-- treating completed_at as a synonym for created_at.
--
-- Direct INSERT/UPDATE remains restricted by RLS. These RPCs use SECURITY
-- DEFINER so anonymous respondents can advance their own draft. The submission
-- id returned by start_submission acts as the capability — UUID v4 entropy is
-- sufficient and we additionally verify form_id on each update to make sure a
-- caller can't update a draft belonging to a different form.

create or replace function public.start_submission(
  p_form_id uuid,
  p_started_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_published boolean;
  v_id uuid;
begin
  select is_published into v_published
  from public.forms
  where id = p_form_id;

  if v_published is null then
    raise exception 'form_not_found';
  end if;
  if v_published is false then
    raise exception 'form_not_published';
  end if;

  insert into public.submissions (form_id, started_at, answers, completed_at)
  values (p_form_id, p_started_at, '{}'::jsonb, null)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.update_submission(
  p_submission_id uuid,
  p_form_id uuid,
  p_answers jsonb,
  p_completed_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_completed timestamptz;
  v_form_id uuid;
begin
  -- FOR UPDATE serializes concurrent updates so the completed_at guard below
  -- can't race with another caller setting it.
  select completed_at, form_id into v_completed, v_form_id
  from public.submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'submission_not_found';
  end if;
  if v_form_id <> p_form_id then
    raise exception 'form_mismatch';
  end if;
  if v_completed is not null then
    raise exception 'already_completed';
  end if;

  update public.submissions
  set answers = p_answers,
      completed_at = coalesce(p_completed_at, completed_at)
  where id = p_submission_id;
end;
$$;

grant execute on function public.start_submission(uuid, timestamptz) to anon, authenticated;
grant execute on function public.update_submission(uuid, uuid, jsonb, timestamptz) to anon, authenticated;
