var Q = Quintus()
     .include("Sprites, Scenes, Input, 2D, Touch, UI, Audio")
     .setup({
           maximize: true,
           scaleToFit: true
      }).controls().touch()


Q.enableSound();

//Definición de la clase jugador
Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, { asset: "player.png", x: 110, y: 595, jumpSpeed: -380, isJumping: false});
         this.add('2d, platformerControls');               
    },
    //Para que el sprite gire al darse la vuelta
    step: function(dt) {
        if(Q.inputs['left'] && this.p.direction == 'right') {
             this.p.flip = 'x';
        } 
        if(Q.inputs['right']  && this.p.direction == 'left') {
            this.p.flip = false;                    
        }
        if(this.p.y > 700){
        	Q.stageScene("endGame",1, { label: "Has muerto :( " }); 
            this.destroy();
        }
    }                    
});

//Creación de la clase enemigo
Q.Sprite.extend("Enemy", {
    init: function(p) {
        this._super(p, {asset: "enemy.png", vx: -100, y: 650, visibleonly: true});
        this.add('2d, aiBounce');
        //Escucha una colision por los lados o por debajo, si colisiona con un jugador, termina el juego. 
        this.on("bump.left,bump.right,bump.bottom",function(collision) {
            if(collision.obj.isA("Player")) { 
                Q.stageScene("endGame",1, { label: "Has muerto :( " }); 
                collision.obj.destroy();
            }
        });
        //Si el jugador salta encima del enemigo, desturimos el objeto enemigo y recibimos un ligero
        this.on("bump.top",function(collision) {
            if(collision.obj.isA("Player")) { 
                this.destroy();
                collision.obj.p.vy = -300;
                Q.audio.play('hit.mp3');
            }
        });               
        //to make the enemy flip when bumps with a wall
        //default direction is left

        this.on("bump.left", function(collision){
            this.p.flip = 'x';
        });
        this.on("bump.right", function(collision){
            if(this.p.direction == 'right') {
                this.p.flip = 'x';
            }
        });
                    
    }
                                  
});

Q.Sprite.extend("CoinGold", {
    init: function(p) {
        this._super(p, {asset: "coinGold.png"});
        // Write event handlers to respond hook into behaviors.
        // hit.sprite is called everytime the player collides with a sprite
        this.on("hit.sprite",function(collision) {
        // Check the collision, if it's the player, you win!
        	if(collision.obj.isA("Player")) {
            // Stage the endGame scene above the current stage
            	Q.stageScene("toLevel2",1, { label: "¡Ganaste!   " }); 
            // Remove the player to prevent them from moving
            	this.destroy();
            	collision.obj.destroy();
            	Q.audio.play('coin.mp3');

       		}
        });
    }
});

Q.Sprite.extend("CoinGold2", {
    init: function(p) {
        this._super(p, {asset: "coinGold.png"});
        // Write event handlers to respond hook into behaviors.
        // hit.sprite is called everytime the player collides with a sprite
        this.on("hit.sprite",function(collision) {
        // Check the collision, if it's the player, you win!
        	if(collision.obj.isA("Player")) {
            // Stage the endGame scene above the current stage
            	Q.stageScene("endGame",1, { label: "¡Ganaste!   " }); 
            // Remove the player to prevent them from moving
            	this.destroy();
            	collision.obj.destroy();
            	Q.audio.play('coin.mp3');

       		}
        });
    }
});

//Cargamos recursos
Q.load("tiles_map.png, player.png, enemy.png, coinGold.png, level1.tmx, level2.tmx, hit.mp3, coin.mp3", function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});          
    Q.stageScene("level1");
});

//creación de la escena level1
Q.scene("level1",function(stage) {          
    var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);   
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));  

    var player = stage.insert(new Q.Player());
    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
    var enemy = stage.insert(new Q.Enemy({x: 1016}));
    
    var enemy = stage.insert(new Q.Enemy({x: 1570}));

    stage.insert(new Q.CoinGold({ x: 2472, y: 595 }));
});

//La escena de transición al nivel 2
Q.scene('toLevel2',function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));

    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Ir al nivel 2" }))         
    var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
    //Cuando pulsamos el botón borramos todas las escenas y cargamos la primera fase
    button.on("click",function() {
        Q.clearStages();
        Q.stageScene('level2');
    });
  
    //Expande la caja para que se vea mejor
    container.fit(20);
});

//creación de la escena level2
Q.scene("level2",function(stage) {          
    var background = new Q.TileLayer({ dataAsset: 'level2.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);   
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level2.tmx', layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));  

    var player = stage.insert(new Q.Player());
    stage.add("viewport").follow(background);
    stage.insert(new Q.CoinGold2({ x: 374, y: 595 }));
    
});


//La escena fin del juego
Q.scene('endGame',function(stage) {
    var container = stage.insert(new Q.UI.Container({
        x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));

    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Jugar otra vez" }))         
    var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
    //Cuando pulsamos el botón borramos todas las escenas y cargamos la primera fase
    button.on("click",function() {
        Q.clearStages();
        Q.stageScene('level1');
    });
  
    //Expande la caja para que se vea mejor
    container.fit(20);
});
