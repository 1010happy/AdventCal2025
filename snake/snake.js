/**************snake game*******************/
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var grid = 16;
var count = 0;
var start_x = 160;
var start_y = 160;
var start_len = 6;
var speed = grid;
var fps_div = grid / 8;

var requestedDirection = 0; //0 for no direction, 1 for left, 2 for up, 3 for right, 4 for down
const LEFTKEY = 37; //left arrow
const UPKEY = 38; //up arrow
const RIGHTKEY = 39; //right arrow
const DOWNKEY = 40; //down arrow

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const OPPOSITE_DIRS = [RIGHT,DOWN,LEFT,UP];

const MODE = 2; //debugging
/*0 for keyboard control, 
1 for just random, 
2 for all together ie. normal running
*/

var p_live = 0.0;
var p_reward = 0.0;

var slider_p_live = 0.0;
var slider_p_reward = 0.0;

var running = true;

var snake = {
  x: start_x,
  y: start_y,
  direction: RIGHT,
  dx: speed,
  dy: 0,
  cells: [],
  maxCells: start_len
};

var apple = {
  x: 320,
  y: 320
};

function getRandomInt(min, max) { //max exclusive
  return Math.floor(Math.random() * (max - min)) + min; //math.random >=0 <1
}

function randomDirection(a){
  var i = getRandomInt(0, a.length);
  return (a[i]);
}

function restart() {
  snake.x = start_x;
  snake.y = start_y;
  snake.cells = [];
  snake.maxCells = start_len;
  snake.dx = speed;
  snake.dy = 0;

  apple.x = getRandomInt(0, 25) * grid;
  apple.y = getRandomInt(0, 25) * grid;
}

function dirToCoords(d){ //have a direction that only updates 
  if (d === LEFT) {
    dx = -speed;
    dy = 0;
  } else if (d === UP) {
    dx = 0;
    dy = -speed;
  } else if (d === RIGHT) {
    dx = speed; 
    dy = 0;
  } else if (d === DOWN) {
    dx = 0;
    dy = speed;
  }
  return [snake.x + dx, snake.y + dy];
}

function checkEdgeDeath(x,y) {
  if (x < 0 || x >= canvas.width ||
      y < 0 || y >= canvas.height) {
    return true;
  }
  return false;
}

function checkSelfDeath(x,y, headadded = 1) { //headadded = 1 means checking actual
  var l = snake.cells.length; //if headadded, means its checking actual death, ie. check all
  if(headadded == 0) l = (snake.cells.length - 1); //if max length, don't check the last cell
  for (var i = headadded; i < l; i++) {
    if (x === snake.cells[i].x && y === snake.cells[i].y) {
      return true;//restart();
    }
  }
  return false;
}

function checkLive(d){ // if new head in x,y will it die
  var [new_x,new_y] = dirToCoords(d); //this has to be correct
  if(checkEdgeDeath(new_x,new_y)){
    return false; //edge death
  }
  if(checkSelfDeath(new_x,new_y,0)){
    return false; //self death
  }
  return true;
}

function rewardDirection(d){ //is d in the direction of the reward?
  if(apple.x > snake.x && d === RIGHT) return true;
  else if(apple.x < snake.x && d === LEFT) return true;
  else if(apple.y > snake.y && d === DOWN) return true;
  else if(apple.y < snake.y && d === UP) return true;
  else return false;
}

function updateDirection(d){ //only updates if there's actually a requested direction
  if (d === LEFT && snake.dx === 0) { //if direction updated again before snake moves, die
    snake.direction = d;
    snake.dx = -speed;
    snake.dy = 0;
  } else if (d === UP && snake.dy === 0) {
    snake.direction = d;
    snake.dx = 0;
    snake.dy = -speed;
  } else if (d === RIGHT && snake.dx === 0) {
    snake.direction = d;
    snake.dx = speed; 
    snake.dy = 0;
  } else if (d === DOWN && snake.dy === 0) {
    snake.direction = d;
    snake.dx = 0;
    snake.dy = speed;
  }
}

function requestDirection(d){
  if(d === LEFTKEY) requestedDirection = LEFT;
  else if(d === UPKEY) requestedDirection = UP;
  else if(d === RIGHTKEY) requestedDirection = RIGHT;
  else if(d === DOWNKEY) requestedDirection = DOWN;
  else; //other key pressed
}

function loop() {
  requestAnimationFrame(loop);

  if (++count < fps_div) return;
  count = 0;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if(MODE == 0 || MODE == 1){ 
    if(MODE == 1) updateDirection(randomDirection([LEFT, UP, RIGHT, DOWN])); //random directions
    else updateDirection(requestedDirection); //keyboard control 
  }

  //if empty, means all reward directions are death 

  if(MODE == 2){
    var live = Math.random() < p_live ? true:false; //avoid death this round?
    var reward = Math.random() < p_reward ? true:false; //avoid life this round?
    // console.log("live: " + live + ", reward: " + reward);

    var curdirs = [LEFT, UP, RIGHT, DOWN];
    var i = curdirs.indexOf(OPPOSITE_DIRS[snake.direction]); //find the current direction
    if(i > -1) curdirs.splice(i, 1); //remove the current direction; the power of 0,1,2,3 :)

    if(live) curdirs = curdirs.filter(d => checkLive(d)); //remove death directions)
    //for the kids, this only checks 1 step ahead.

    if(curdirs.length == 0) restart(); //die //don't even bother choosing lol
    else{
      //notes: this oscillates. I havent tried to find out why yet, but if it looks realistic and works...
      var nondeaths = curdirs.slice(); //actual copy
      if(reward) curdirs = curdirs.filter(d => rewardDirection(d)); //remove non-reward directions (strictly in the direction (ie. directly above, rejects L and R))
      if(curdirs.length == 0) curdirs = nondeaths; //choose something that won't die (yes, this implicitly prioritises surviving over reward, but enhances the point of the exercise if its slightly more likely to stall)
      if(curdirs.includes(OPPOSITE_DIRS[snake.direction])) curdirs.push(OPPOSITE_DIRS[snake.direction]); //duplicate the opposite direction  //whether this holds "correctness" is arguable, but if the direction in the opposite of the current direction is in the list of directions to be chosen, duplicate it so its x2 (just like normal random direction))
      
      // console.log("randomized");
      updateDirection(randomDirection(curdirs)); //randomise from curdirs
    }
  }

  snake.x += snake.dx;
  snake.y += snake.dy;
  if(checkEdgeDeath(snake.x,snake.y)) restart(); //needed (only checks no death if live)

  //add self and remove
  snake.cells.unshift({x: snake.x, y: snake.y});
  if (snake.cells.length > snake.maxCells) { 
    snake.cells.pop();
  }

  //actually kill self
  if(checkSelfDeath(snake.x, snake.y)){
    console.log("self death");
    restart();
  }
  
  context.fillStyle = 'green';
  snake.cells.forEach(function (cell, index) { //draw snake and check apple obtaining
    context.fillRect(cell.x, cell.y, grid - 1, grid - 1);
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }
  });

  //draw apple
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid - 1, grid - 1);
}


/**************keycontrol*******************/
if(MODE == 0){
    document.addEventListener('keydown', function (e) {
      requestDirection(e.which);
   });
}


/**************speed_slider*******************/
// var slider = document.getElementById("speedSlider");
// var output = document.getElementById("speedVal");
// output.innerHTML = slider.value;

// slider.oninput = function () {
//   output.innerHTML = this.value;
//   fps_div = grid / parseFloat(this.value);  // ^ valu= faster
// };

/**************reward_slider*******************/
var r_slider = document.getElementById("rewardSlider");
var r_output = document.getElementById("rewardVal");
r_output.innerHTML = r_slider.value;

r_slider.oninput = function () {
  r_output.innerHTML = this.value;
  if(this.value == 0) slider_p_reward = 0.0; //no reward
  else if(this.value == 1) slider_p_reward = 0.4; //50% chance of targetting reward
  else if(this.value == 2) slider_p_reward = 0.7; //70% chance of targetting reward
};

/**************DeathPenaltys_slider*******************/
var d_slider = document.getElementById("deathPenaltySlider");
var d_output = document.getElementById("deathVal");
d_output.innerHTML = d_slider.value;

d_slider.oninput = function () {
  d_output.innerHTML = this.value;
  if(this.value == 0) slider_p_live = 0.0; //no reward
  else if(this.value == 1) slider_p_live = 0.5; //50% chance of targetting reward
  else if(this.value == 2) slider_p_live = 1.0; //70% chance of targetting reward
};

/**************TimePenaltys_slider*******************/
var t_slider = document.getElementById("timePenaltySlider");
var t_output = document.getElementById("timeVal");
t_output.innerHTML = t_slider.value;

t_slider.oninput = function () {
  t_output.innerHTML = this.value;
  if(this.value == 1) slider_p_reward += 0.15; //no reward
  else if(this.value == 2) slider_p_reward += 0.15; //70% chance of targetting reward
};

/**********click button ************/
function b_click(){
  console.log("clc");
  p_live = slider_p_live;
  p_reward = slider_p_reward;
}


//Start game
requestAnimationFrame(loop);

//interested students can do the actual version of this with
// https://medium.com/@nancy.q.zhou/teaching-an-ai-to-play-the-snake-game-using-reinforcement-learning-6d2a6e8f3b1c
