# School Flirt

A vanilla JavaScript and Canvas school hallway game inspired by the classic *School Flirt* mechanics. The tutorial and game artwork are drawn from original Canvas shapes; audio is synthesized with Web Audio.

## Play locally

Serve this folder with any static HTTP server, such as `python -m http.server 8000`, then open `http://localhost:8000`.

## Controls

- Move the mouse to walk toward the cursor; far-away destinations make the player run.
- Move the cursor over a boy's head to lock on.
- Press and hold the left mouse button to fire the love beam and fill his heart.
- Click repeatedly during a rival showdown to win.
- Collect the dropped hearts to refill the love meter and increase your score.
- Avoid teachers. Hitting one knocks the player down and drains the meter.
- The round ends when the clock runs out or the love meter is empty.

## Project structure

- `src/assets`: Canvas character and hallway art.
- `src/audio`: Independent music and sound-effect services.
- `src/core`: Application composition and balance configuration.
- `src/effects`: Particle effects.
- `src/entities`: Player, boys, rivals, teachers, and heart pickups.
- `src/input`: Mouse, touch, and keyboard input normalization.
- `src/rendering`: Tutorial and game canvas presentation.
- `src/scenes`: Round rules, state, and events.
- `src/styles`: Responsive arcade cabinet presentation.

GitHub Pages deploys the static site from `master` using the workflow in `.github/workflows/pages.yml`.
