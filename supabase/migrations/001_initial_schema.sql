-- Forms table
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Form',
  slug text not null,
  welcome_screen jsonb not null default '{"title": "Welcome", "buttonText": "Start"}'::jsonb,
  thank_you_screen jsonb not null default '{"title": "Thank you!"}'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique slug per user
create unique index forms_slug_idx on public.forms (slug);

-- Index for user queries
create index forms_user_id_idx on public.forms (user_id);

-- Submissions table
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for form queries
create index submissions_form_id_idx on public.submissions (form_id);
create index submissions_created_at_idx on public.submissions (created_at desc);

-- RLS policies
alter table public.forms enable row level security;
alter table public.submissions enable row level security;

-- Forms: owners can CRUD their own forms
create policy "Users can view own forms"
  on public.forms for select
  using (auth.uid() = user_id);

create policy "Users can create forms"
  on public.forms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own forms"
  on public.forms for update
  using (auth.uid() = user_id);

create policy "Users can delete own forms"
  on public.forms for delete
  using (auth.uid() = user_id);

-- Forms: anyone can view by slug (for respondents)
create policy "Anyone can view forms by slug"
  on public.forms for select
  using (true);

-- Submissions: anyone can insert (respondents)
create policy "Anyone can submit responses"
  on public.submissions for insert
  with check (true);

-- Submissions: form owners can view
create policy "Form owners can view submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = submissions.form_id
      and forms.user_id = auth.uid()
    )
  );

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger forms_updated_at
  before update on public.forms
  for each row execute function public.handle_updated_at();
