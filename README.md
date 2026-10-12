# School Flirt

A vanilla JavaScript and Canvas school hallway game inspired by the classic *School Flirt* mechanics. The tutorial and game artwork are drawn from original Canvas shapes; audio is synthesized with Web Audio.

## Play locally

Serve this folder with any static HTTP server, such as `python -m http.server 8000`, then open `http://localhost:8000`.

## Controls

- Use Left/Right arrows or the on-screen touch arrows to walk; hold Space or Run to sprint.
- Reach a staircase and press Up/Down (or its on-screen arrows) to change floors.
- Hover over a boy to lock on, then click/tap repeatedly to fill his heart.
- Click quickly during a rival's showdown; every defeated rival adds a 15% conquest bonus.
- Avoid teachers. A collision knocks the protagonist down and drains energy.
- Collect hearts to restore energy. At zero, the protagonist pauses briefly to recover.
- Each 3-minute match has boy, score, and floor objectives. Level 5 also requires the 5-star boy.
- Music and sound effects have separate toggles.

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
