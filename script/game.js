/*jslint bitwise:true, es5: true */
(function (window, undefined) {

    var canvas = null,
        ctx = null;
    // game score
    var score = 0;
    // Player object
    var body = [];
    // Food object
    var food = null;
    // wall array
    var wall = [];
    // Direction 0= UP, 1= right, 2= down, 3 = left
    var dir = 0;
    // Last pressed key
    var lastPress = null;
    // store pause state
    var pause = true;
    var gameover = true;

    // images
    var iBody = new Image();
    var iFood = new Image();

    //Audio
    var aEat = new Audio();
    var aDie = new Audio();


    // definition, maybe const?
    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40;

    function Rectangle(x, y, width, height) {
        this.x = (x === null) ? 0 : x;
        this.y = (y === null) ? 0 : y;
        this.width = (width === null) ? 0 : width;
        this.height = (height === null) ? this.width : height;
    }

    Rectangle.prototype = {
        constructor: Rectangle,

        intersects: function (rect) {
            if (rect === null) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
            }
        },

        fill: function (ctx) {
            if (ctx === null) {
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        },

        drawImage:  function (ctx, img) {
            if (img === null) {
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                    ctx.drawImage(img, this.x, this.y);
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    };
    // reset values to restart game
    function reset() {
        score = 0;
        dir = 1;
        body[0].x = 40;
        body[0].y = 40;
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
    }

    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }

    // Draw in canvas
    function paint(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Draw body[0]
        ctx.fillStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i += 1) {
            //body[i].fill(ctx);
            body[i].drawImage(ctx,iBody);
        }

        // Draw food
        ctx.fillStyle = '#f00';
        //food.fill(ctx);
        food.drawImage(ctx,iFood);

        // Draw walls
        ctx.fillStyle = '#999';
        for (i = 0, l = wall.length; i < l; i += 1) {
            wall[i].fill(ctx);
        }

        // White
        ctx.fillStyle = '#fff';
        // Draw score
        ctx.fillText('Score: ' + score, 0, 10);
        // Draw pause
        if (pause) {
            ctx.textAlign = 'center';
            if (gameover) {
                ctx.fillText('GAME OVER', 150, 75);
            } else {
                ctx.fillText('PAUSE', 150, 75);
            }
            ctx.textAlign = 'left';
        }
    } 
    //Execute actions
    function act(){
        if(!pause){
            // GameOver Reset
            if (gameover) {
                reset();
            }
            // Change Direction
            if (lastPress === KEY_UP) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT) {
                dir = 3;
            }
            // Move Rect
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }
            // Out Screen
            if (body[0].x > canvas.width  - body[0].width) {
                body[0].x = 0;
            }
            if (body[0].y > canvas.height - body[0].height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width - body[0].width;
            }
            if (body[0].y < 0) {
                body[0].y = canvas.height - body[0].height;
            }
            // Move Body
            for (i = body.length - 1; i > 0; i -= 1) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }

            // Body Intersects
            for (i = 2, l = body.length; i < l; i += 1) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    aDie.play();
                }
            }
                // Food Intersects
            if (body[0].intersects(food)) {
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                body.push(new Rectangle(food.x, food.y, 10, 10));
                aEat.play();
            }

            // Wall Intersects
            for (i = 0, l = wall.length; i < l; i += 1) {
                if (food.intersects(wall[i])) {
                    food.x = random(canvas.width / 10 - 1) * 10;
                    food.y = random(canvas.height / 10 - 1) * 10;
                } 
                if (body[0].intersects(wall[i])) {
                    pause = true;
                    gameover = true;
                    aDie.play();
                }
            }
        }
        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }
    //Get Canvas and context then draw and take actions
    function init() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        // Create player
        //player = new Rectangle(40, 40, 10, 10);
        body.push(new Rectangle(40, 40, 10, 10));
        //food for the snake
        food = new Rectangle(80, 80, 10, 10);

        // Create walls
        // wall.push(new Rectangle(100, 50, 10, 10));
        // wall.push(new Rectangle(100, 100, 10, 10));
        // wall.push(new Rectangle(200, 50, 10, 10));
        // wall.push(new Rectangle(200, 100, 10, 10));

        // Load assets
        iBody.src = 'assets/body.png';
        iFood.src = 'assets/fruit.png';

        if (canPlayOgg()) {
            aEat.src = 'assets/chomp.oga';
            aDie.src = 'assets/dies.oga';
            } else {
            aEat.src = 'assets/chomp.m4a';
            aDie.src = 'assets/dies.m4a';
        }

        run();
        repaint();
    } 
    // Call run @ 20fps?
    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(ctx);
    }
    function run() {
        setTimeout(run, 50);
        act();
    }
    // Init after load
    window.addEventListener('load', init, false);
    // listen keyboard events
    document.addEventListener('keydown', function (evt) {
        lastPress = evt.which;
    }, false);

    // For compatibility with older browsers
    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
        window.setTimeout(callback, 17);
        };
    }());
    // Aux funtion for random number generation
    function random(max) {
        return Math.floor(Math.random() * max);
    }
}(window));