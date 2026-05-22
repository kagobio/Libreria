-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now()
);

-- Books (shared library)
create table if not exists books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  genre text,
  description text,
  spine_color text default '#8B4513',
  added_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Ratings (one per user per book)
create table if not exists ratings (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score integer check (score >= 1 and score <= 5) not null,
  created_at timestamptz default now(),
  unique(book_id, user_id)
);

-- Comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references books(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table books enable row level security;
alter table ratings enable row level security;
alter table comments enable row level security;

-- Profiles policies
create policy "Users can view all profiles" on profiles for select to authenticated using (true);
create policy "Users can insert own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update to authenticated using (auth.uid() = id);

-- Books policies
create policy "Authenticated users can view books" on books for select to authenticated using (true);
create policy "Authenticated users can insert books" on books for insert to authenticated with check (auth.uid() = added_by);
create policy "Users can delete own books" on books for delete to authenticated using (auth.uid() = added_by);

-- Ratings policies
create policy "Authenticated users can view ratings" on ratings for select to authenticated using (true);
create policy "Users can insert own ratings" on ratings for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own ratings" on ratings for update to authenticated using (auth.uid() = user_id);

-- Comments policies
create policy "Authenticated users can view comments" on comments for select to authenticated using (true);
create policy "Users can insert own comments" on comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete own comments" on comments for delete to authenticated using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
