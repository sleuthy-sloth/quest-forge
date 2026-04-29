-- Migration: 018_update_all_boss_sprites
-- Overhauls boss_sprite_config for all 52 weekly story chapters
-- across all households. Weeks 1-47 use scale 2; weeks 48-52 (Hollow King arc) use scale 3.

UPDATE story_chapters
SET boss_sprite_config = CASE week_number
  WHEN 1  THEN '{"base_sprite":"procedural_treant","palette":"blight_hollow","scale":2,"particles":["blight_spore","root_crawl","dark_aura"],"frame":"frame_epic","glow_color":"#6a1fa8"}'::jsonb
  WHEN 2  THEN '{"base_sprite":"bee","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 3  THEN '{"base_sprite":"procedural_giant","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 4  THEN '{"base_sprite":"procedural_flame","palette":"ember_corrupt","scale":2,"particles":["ember_float","spark_burst"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 5  THEN '{"base_sprite":"ghost","palette":"frost_hollow","scale":2,"particles":["shadow_tendril","glow_pulse"],"frame":"frame_epic","glow_color":"#00ccff"}'::jsonb
  WHEN 6  THEN '{"base_sprite":"slime","palette":"frost_hollow","scale":2,"particles":["shadow_tendril","glow_pulse"],"frame":"frame_epic","glow_color":"#00ccff"}'::jsonb
  WHEN 7  THEN '{"base_sprite":"ghost","palette":"frost_hollow","scale":2,"particles":["glow_pulse","dark_aura"],"frame":"frame_epic","glow_color":"#00ccff"}'::jsonb
  WHEN 8  THEN '{"base_sprite":"snake","palette":"ash_gray","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 9  THEN '{"base_sprite":"procedural_golem","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 10 THEN '{"base_sprite":"slime","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 11 THEN '{"base_sprite":"procedural_golem","palette":"ember_corrupt","scale":2,"particles":["ember_float","shadow_tendril"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 12 THEN '{"base_sprite":"big_worm","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 13 THEN '{"base_sprite":"snake","palette":"ash_gray","scale":2,"particles":["ash_fall","glow_pulse"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 14 THEN '{"base_sprite":"bee","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril","glow_pulse"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 15 THEN '{"base_sprite":"procedural_giant","palette":"ash_gray","scale":2,"particles":["ash_fall","glow_pulse"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 16 THEN '{"base_sprite":"procedural_flame","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","ember_float"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 17 THEN '{"base_sprite":"pumpking","palette":"ash_gray","scale":2,"particles":["ash_fall","blight_spore"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 18 THEN '{"base_sprite":"slime","palette":"frost_hollow","scale":2,"particles":["glow_pulse","lightning_arc"],"frame":"frame_epic","glow_color":"#00ccff"}'::jsonb
  WHEN 19 THEN '{"base_sprite":"big_worm","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 20 THEN '{"base_sprite":"eyeball","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 21 THEN '{"base_sprite":"bee","palette":"ember_corrupt","scale":2,"particles":["ember_float","ash_fall"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 22 THEN '{"base_sprite":"ghost","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 23 THEN '{"base_sprite":"procedural_golem","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","ash_fall"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 24 THEN '{"base_sprite":"ghost","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 25 THEN '{"base_sprite":"procedural_golem","palette":"ember_corrupt","scale":2,"particles":["ember_float","spark_burst"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 26 THEN '{"base_sprite":"procedural_flame","palette":"ember_corrupt","scale":2,"particles":["ember_float","spark_burst","lightning_arc"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 27 THEN '{"base_sprite":"ghost","palette":"hollow_dark","scale":2,"particles":["glow_pulse","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 28 THEN '{"base_sprite":"procedural_flame","palette":"ember_corrupt","scale":2,"particles":["ember_float","spark_burst","glow_pulse"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 29 THEN '{"base_sprite":"ghost","palette":"ember_corrupt","scale":2,"particles":["ember_float","shadow_tendril"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 30 THEN '{"base_sprite":"slime","palette":"ash_gray","scale":2,"particles":["ash_fall","spark_burst"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 31 THEN '{"base_sprite":"ghost","palette":"ash_gray","scale":2,"particles":["ash_fall","dark_aura"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 32 THEN '{"base_sprite":"eyeball","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 33 THEN '{"base_sprite":"ghost","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 34 THEN '{"base_sprite":"procedural_giant","palette":"ember_corrupt","scale":2,"particles":["ember_float","shadow_tendril"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 35 THEN '{"base_sprite":"ghost","palette":"ash_gray","scale":2,"particles":["ash_fall","glow_pulse"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 36 THEN '{"base_sprite":"eyeball","palette":"frost_hollow","scale":2,"particles":["glow_pulse","lightning_arc"],"frame":"frame_epic","glow_color":"#00ccff"}'::jsonb
  WHEN 37 THEN '{"base_sprite":"ghost","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 38 THEN '{"base_sprite":"slime","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","lightning_arc"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 39 THEN '{"base_sprite":"slime","palette":"ash_gray","scale":2,"particles":["ash_fall","lightning_arc"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 40 THEN '{"base_sprite":"procedural_giant","palette":"hollow_dark","scale":2,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 41 THEN '{"base_sprite":"slime","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 42 THEN '{"base_sprite":"eyeball","palette":"ash_gray","scale":2,"particles":["ash_fall","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 43 THEN '{"base_sprite":"procedural_giant","palette":"ember_corrupt","scale":2,"particles":["ember_float","shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 44 THEN '{"base_sprite":"procedural_treant","palette":"ash_gray","scale":2,"particles":["ash_fall","root_crawl","shadow_tendril"],"frame":"frame_epic","glow_color":"#888888"}'::jsonb
  WHEN 45 THEN '{"base_sprite":"procedural_treant","palette":"hollow_dark","scale":2,"particles":["blight_spore","shadow_tendril","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 46 THEN '{"base_sprite":"procedural_flame","palette":"ember_corrupt","scale":2,"particles":["ember_float","glow_pulse","dark_aura"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 47 THEN '{"base_sprite":"procedural_flame","palette":"ember_corrupt","scale":2,"particles":["ember_float","spark_burst","lightning_arc","glow_pulse"],"frame":"frame_epic","glow_color":"#ff4500"}'::jsonb
  WHEN 48 THEN '{"base_sprite":"procedural_hollow_king","palette":"hollow_dark","scale":3,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 49 THEN '{"base_sprite":"procedural_hollow_king","palette":"hollow_dark","scale":3,"particles":["shadow_tendril","dark_aura"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 50 THEN '{"base_sprite":"procedural_hollow_king","palette":"hollow_dark","scale":3,"particles":["shadow_tendril","dark_aura","glow_pulse"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 51 THEN '{"base_sprite":"procedural_hollow_king","palette":"hollow_dark","scale":3,"particles":["shadow_tendril","dark_aura","glow_pulse","ember_float"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  WHEN 52 THEN '{"base_sprite":"procedural_hollow_king","palette":"hollow_dark","scale":3,"particles":["shadow_tendril","dark_aura","glow_pulse","ember_float","lightning_arc"],"frame":"frame_epic","glow_color":"#4a0080"}'::jsonb
  ELSE boss_sprite_config
END
WHERE week_number BETWEEN 1 AND 52;
