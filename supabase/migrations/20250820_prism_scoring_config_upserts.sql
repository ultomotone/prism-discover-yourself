insert into public.scoring_config(key, value) values
('neuro_norms', '{"mean":3,"sd":1}'),
('overlay_neuro_cut', '0.50'),
('overlay_state_weights', '{"stress":0.35,"time":0.25,"sleep":-0.20,"focus":-0.20}'),
('trait_norms', '{"N":{"mean":3,"sd":1}}')
on conflict (key) do update set value=excluded.value;
