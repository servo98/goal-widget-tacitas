


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
    // URLs de los sonidos en Discord (modifica aquí tus enlaces)
    const bounceSoundUrls = [
      'https://servo98.github.io/goal-widget-tacitas/assets/glass1.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass2.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass3.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass4.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass5.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass6.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass7.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass8.mp3',
      'https://servo98.github.io/goal-widget-tacitas/assets/glass9.mp3'
    ];
    const bounceSounds = [];
    console.log('Intentando cargar sonidos:', bounceSoundUrls);
    bounceSoundUrls.forEach((url, idx) => {
      this.load.audio('glass' + (idx + 1), url);
    });
    this.load.once('complete', () => {
      bounceSoundUrls.forEach((url, idx) => {
        try {
          const snd = this.sound.add('glass' + (idx + 1));
          bounceSounds.push(snd);
          console.log('Sonido cargado:', 'glass' + (idx + 1), url);
        } catch (e) {
          console.error('Error cargando sonido:', 'glass' + (idx + 1), url, e);
        }
      });
      sceneRef.bounceSounds = bounceSounds;
      console.log('Todos los sonidos cargados:', bounceSounds);
    });
    this.load.start();
    sceneRef = this;
    window.addEventListener('onEventReceived', function (obj) {
      const data = obj.detail.event;
      if (data && data.amount && data.type === 'cheer') {
        // Tamaño proporcional a la cantidad de bits (mínimo 20, máximo 100)
        const minSize = 20;
        const maxSize = 100;
        const minBits = 1;
        const maxBits = 10000;
        let size = minSize;
        if (data.amount >= minBits) {
          size = minSize + ((Math.min(data.amount, maxBits) - minBits) / (maxBits - minBits)) * (maxSize - minSize);
        }
        const x = Phaser.Math.Between(size / 2, config.width - size / 2);
        const color = Phaser.Display.Color.HSVColorWheel()[Phaser.Math.Between(0, 359)].color;
        const ellipse = sceneRef.add.ellipse(x, 0, size, size, color).setStrokeStyle(2, 0xffffff);
        sceneRef.matter.add.gameObject(ellipse, { shape: { type: 'circle', radius: size / 2 } });
        ellipse.body.friction = 0.005;
        // Asignar un poder de rebote aleatorio entre 0.4 y 0.8 para evitar rebotes infinitos
        ellipse.body.restitution = Phaser.Math.FloatBetween(0.4, 0.8);
        ellipse.bouncePower = ellipse.body.restitution;
        // Asignar un sonido aleatorio a la partícula y ajustar el pitch proporcional al tamaño
        if (sceneRef.bounceSounds && sceneRef.bounceSounds.length > 0) {
          ellipse.bounceSound = Phaser.Utils.Array.GetRandom(sceneRef.bounceSounds);
          // Ajustar el pitch (rate) proporcional al tamaño, centrando la media en bits=100
          // minSize = 20, maxSize = 100, minRate = 1.0, maxRate = 1.7 (más agudo en general)
          // Para bits=100 (size=28.8), rate=1.0; para size=100, rate=1.7; para size=20, rate=0.85
          const minRate = 0.85;
          const maxRate = 1.7;
          // Centrar la media en size=32 (aprox bits=100)
          // Mapeo lineal: size=20->minRate, size=100->maxRate
          const rate = minRate + ((size - minSize) / (maxSize - minSize)) * (maxRate - minRate);
          ellipse.bounceSound.setRate(rate);
        }
        // Darle una velocidad inicial real en parábola (como meteorito)
        const lateralVel = Phaser.Math.FloatBetween(-7, 7); // velocidad lateral significativa
        const downVel = Phaser.Math.FloatBetween(6, 10);    // velocidad vertical hacia abajo
        sceneRef.matter.body.setVelocity(ellipse.body, { x: lateralVel, y: downVel });
        particles.push(ellipse);
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

    // Evento de colisión: cada partícula reproduce su propio sonido
    this.matter.world.on('collisionstart', function (event) {
      event.pairs.forEach(pair => {
        [pair.bodyA, pair.bodyB].forEach(body => {
          if (body.gameObject && body.gameObject.bounceSound) {
            // Solo reproducir si no está ya sonando
            if (!body.gameObject.bounceSound.isPlaying) {
              console.log('Reproduciendo sonido:', body.gameObject.bounceSound.key);
              body.gameObject.bounceSound.play();
            }
          }
        });
      });
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