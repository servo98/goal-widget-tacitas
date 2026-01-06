


// Bloque listo para pegar en el editor JS de StreamElements
function mainPhaser() {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222',
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 1 },
        debug: false
      }
    },
    scene: {
      create,
      update
    }
  };

  let particles = [];
  let sceneRef;

  function create() {
    // Cargar 9 sonidos de rebote
    const bounceSounds = [];
    for (let i = 1; i <= 9; i++) {
      this.load.audio('glass' + i, 'assets/glass' + i + '.mp3');
    }
    this.load.once('complete', () => {
      for (let i = 1; i <= 9; i++) {
        bounceSounds.push(this.sound.add('glass' + i));
      }
      sceneRef.bounceSounds = bounceSounds;
    });
    this.load.start();
    sceneRef = this;
    window.addEventListener('onEventReceived', function (obj) {
      const data = obj.detail.event;
      if (data && data.amount && data.type === 'cheer') {
        for (let i = 0; i < data.amount; i++) {
          const x = Phaser.Math.Between(30, config.width - 30);
          const color = Phaser.Display.Color.HSVColorWheel()[Phaser.Math.Between(0, 359)].color;
          const ellipse = sceneRef.add.ellipse(x, 0, 36, 36, color).setStrokeStyle(2, 0xffffff);
          sceneRef.matter.add.gameObject(ellipse, { shape: { type: 'circle', radius: 18 } });
          ellipse.body.friction = 0.005;
          ellipse.body.restitution = 1;
          particles.push(ellipse);
        }
      }
    });
    // Suelo
    const ground = this.add.rectangle(config.width/2, config.height+10, config.width, 20, 0x888888);
    this.matter.add.gameObject(ground, { isStatic: true });

    // Pared izquierda
    const leftWall = this.add.rectangle(-10, config.height/2, 20, config.height, 0x888888);
    this.matter.add.gameObject(leftWall, { isStatic: true });

    // Pared derecha
    const rightWall = this.add.rectangle(config.width+10, config.height/2, 20, config.height, 0x888888);
    this.matter.add.gameObject(rightWall, { isStatic: true });

    // Techo
    // const ceiling = this.add.rectangle(config.width/2, -10, config.width, 20, 0x888888);
    // this.matter.add.gameObject(ceiling, { isStatic: true });

    // Evento de colisión para reproducir sonido aleatorio
    this.matter.world.on('collisionstart', function (event) {
      if (sceneRef.bounceSounds && sceneRef.bounceSounds.length > 0) {
        // Elegir un sonido aleatorio que no esté sonando
        const available = sceneRef.bounceSounds.filter(s => !s.isPlaying);
        let sound;
        if (available.length > 0) {
          sound = Phaser.Utils.Array.GetRandom(available);
        } else {
          sound = Phaser.Utils.Array.GetRandom(sceneRef.bounceSounds);
        }
        sound.play();
      }
    });
  }

  function update() {
    particles = particles.filter(p => p.y < config.height + 40);
  }

  new Phaser.Game(config);
}

if (typeof Phaser === 'undefined') {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js';
  s.onload = mainPhaser;
  document.head.appendChild(s);
} else {
  mainPhaser();
}