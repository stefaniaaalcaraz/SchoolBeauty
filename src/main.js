import { Game } from './game.js';

const canvas = document.querySelector('#game-canvas');
const game = new Game(canvas);
game.start();
