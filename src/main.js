import { Game } from './game.js?v=4';

const canvas = document.querySelector('#game-canvas');
const game = new Game(canvas);
game.start();
