# School Beauty

An original Canvas reaction game inspired by the premise of School Flirt. Hold to flirt during a passing period; release when a friend looks your way. Artwork is drawn in Canvas and audio is synthesized with Web Audio; no reference-game assets are included.

Run using a static server, e.g. python -m http.server 8000, then visit http://localhost:8000. Controls: hold mouse/touch or Space to flirt; release when a friend shows ?!. Fill the meter to earn love notes. Sound is optional.

Folders: assets (art), audio (music/effects), core (composition/config), effects (particles), entities (characters), input (controls), rendering (Canvas), scenes (rules), styles (interface). GameScene owns rules and publishes events; rendering, input, HUD, and audio remain separate.
