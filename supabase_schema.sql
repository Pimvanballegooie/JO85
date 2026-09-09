-- JO8-5 teamsite — database-schema
-- Uitvoeren in Supabase: project -> SQL Editor -> New query -> plakken -> Run

create table spelers (
  id serial primary key,
  naam text unique not null,
  rugnummer int,
  foto_url text,
  favoriete_eten text,
  houdt_van text,
  favoriete_speler text,
  favoriete_club text,
  tweebenigheid int default 50,        -- 0 = full linkspoot, 100 = full rechtspoot
  hooghouden_record int default 0,
  is_beheerder boolean default false   -- true voor Luuk, Bas, Sam
);

create table wedstrijden (
  id serial primary key,
  datum date not null,
  tijd time,
  tegenstander text not null,
  thuis_uit text,                      -- 'thuis' | 'uit'
  locatie text,
  eigen_score int,                     -- leeg = nog te spelen (programma); ingevuld = uitslag
  tegen_score int,
  verslag text
);

create table opstellingen (
  id serial primary key,
  wedstrijd_id int references wedstrijden(id) on delete cascade,
  kwart int not null,                  -- 1..4
  spelers jsonb not null default '[]', -- [speler_id x6], index 0 = keeper, 1..5 = veldspelers (vaste veldposities, spelers zijn te verslepen/wisselen)
  wissels jsonb not null default '[]', -- [speler_id, speler_id] — de 2 wissels voor dit kwart
  unique (wedstrijd_id, kwart)
);

-- Publiek leesbaar + beschrijfbaar via de anon key (geen gevoelige data;
-- de site zelf bepaalt wie de bewerk-knoppen te zien krijgt).
alter table spelers enable row level security;
alter table wedstrijden enable row level security;
alter table opstellingen enable row level security;

create policy "iedereen mag lezen - spelers" on spelers for select using (true);
create policy "iedereen mag schrijven - spelers" on spelers for all using (true) with check (true);

create policy "iedereen mag lezen - wedstrijden" on wedstrijden for select using (true);
create policy "iedereen mag schrijven - wedstrijden" on wedstrijden for all using (true) with check (true);

create policy "iedereen mag lezen - opstellingen" on opstellingen for select using (true);
create policy "iedereen mag schrijven - opstellingen" on opstellingen for all using (true) with check (true);

-- De 8 spelers alvast aanmaken (rugnummers vul je later aan via de site of hier).
insert into spelers (naam, is_beheerder) values
  ('Sam', true),
  ('Milas', false),
  ('Giani', false),
  ('Luuk', true),
  ('Bas', true),
  ('Imran', false),
  ('Effe', false),
  ('Joshua', false);
