const maxConfettis = 150;
const particles = [];
const possibleColors = [
  "DodgerBlue",
  "OliveDrab",
  "Gold",
  "Pink",
  "SlateBlue",
  "LightBlue",
  "Gold",
  "Violet",
  "PaleGreen",
  "SteelBlue",
  "SandyBrown",
  "Chocolate",
  "Crimson",
];

function randomFromTo(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

function confettiParticle() {
  this.x = Math.random() * window.innerWidth;
  this.y = Math.random() * window.innerHeight - window.innerHeight;
  this.r = randomFromTo(11, 33);
  this.d = Math.random() * maxConfettis + 11;
  this.color =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
  this.tilt = Math.floor(Math.random() * 33) - 11;
  this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
  this.tiltAngle = 0;

  this.draw = function (context) {
    context.beginPath();
    context.lineWidth = this.r / 2;
    context.strokeStyle = this.color;
    context.moveTo(this.x + this.tilt + this.r / 3, this.y);
    context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
    return context.stroke();
  };
}

function drawConfetti(canvas, stopTime) {
  const context = canvas.getContext("2d");
  const results = [];

  const draw = () => {
    if (Date.now() < stopTime) {
      requestAnimationFrame(draw);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < maxConfettis; i++) {
        results.push(particles[i].draw(context));
      }

      let particle = {};
      let remainingFlakes = 0;
      for (let i = 0; i < maxConfettis; i++) {
        particle = particles[i];
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
        particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;

        if (particle.y <= window.innerHeight) remainingFlakes++;

        if (
          particle.x > window.innerWidth + 30 ||
          particle.x < -30 ||
          particle.y > window.innerHeight
        ) {
          particle.x = Math.random() * window.innerWidth;
          particle.y = -30;
          particle.tilt = Math.floor(Math.random() * 10) - 20;
        }
      }
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  draw();
}

function triggerConfetti(canvas, duration = 5000) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const stopTime = Date.now() + duration;
  drawConfetti(canvas, stopTime);
}

window.addEventListener(
  "resize",
  () => {
    const canvas = document.getElementById("canvas");
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  },
  false
);

for (let i = 0; i < maxConfettis; i++) {
  particles.push(new confettiParticle());
}

export { triggerConfetti };
