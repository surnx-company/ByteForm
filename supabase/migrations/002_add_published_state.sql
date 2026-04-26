-- Add publish/draft state to forms
alter table public.forms
  add column is_published boolean not null default false;

-- Replace the public read policy so only published forms are visible to anon/visitor sessions.
-- Owners still see their own drafts via the existing "Users can view own forms" policy.
drop policy if exists "Anyone can view forms by slug" on public.forms;

create policy "Anyone can view published forms by slug"
  on public.forms for select
  using (is_published = true);
