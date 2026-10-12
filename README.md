# School Beauty

A framework-free HTML5 Canvas foundation for a 2D side-scroller time management game.

## Run it

Serve this folder with any static web server and open its URL. For example, with Node installed:

```sh
npx serve .
```

ES modules are loaded directly by the browser, so opening `index.html` as a `file://` URL may be blocked by browser module security.

## Project layout

- `index.html`, `styles.css`: responsive 16:9 canvas shell and presentation
- `src/main.js`, `src/game.js`: bootstrapping, state registry, fixed logical resolution and animation loop
- `src/input.js`: unified pointer, touch and keyboard input
- `src/renderer.js`: background, entity and UI scene passes
- `src/camera.js`: horizontally following, world-clamped camera
- `src/entities/`: protagonist stamina/movement and patrol/conquest student behavior
- `src/states/`: isolated state lifecycle and screen behavior

## Controls

- Menu/tutorial: click or tap controls; Enter selects, Escape closes/back, left/right arrows page tutorial slides.
- Gameplay: arrow keys or WASD move; hold Space or Shift to run; click a student to build conquest progress; Enter interacts with a nearby student; Escape pauses.
- Touch/mouse: tap or drag to move toward a point, double-tap to run, or tap a student to conquer them. The large touch controls at the bottom also work.
- Level setup: choose among five levels in the objectives popup; each level has a different five-student star lineup.

The game runs at the browser's animation-frame rate and clamps simulation delta to keep large tab-resume delays from skipping gameplay. The canvas uses a 1920×1080 logical scene and scales proportionally, leaving letterbox space where needed.
