import { Game } from './game.js?v=10';

const canvas = document.querySelector('#game-canvas');
const game = new Game(canvas);
game.start();
