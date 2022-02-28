// the drawing surface
const ctx = document
  .getElementById("screen")
  .getContext("2d", { alpha: false });
const width = 200;
const height = 200;
const imageData = ctx.getImageData(0, 0, width, height);
let pixels = imageData.data;

const frameRateEl = document.getElementById("fps");
const scoreEl = document.getElementById("score");

let keys = [];

// game data
// state
let goGame = false;
// scores
let greenScore = 0;
let redScore = 0;
// world
let bollPositionx = 0;
let bollPositionz = 0;
let bollRed = 0.3;
let bollGreen = 0.3;
let bollBlue = 1;

let paddle1Positionx = -1;
let paddle1Positionz = 0;

let paddle1Normalx = 1;
let paddle1Normalz = 0;

let paddle2Positionx = 1;
let paddle2Positionz = 0;

let paddle2Normalx = -1;
let paddle2Normalz = 0;

let pRays = [];

let paddle1Angle = 0;
let paddle2Angle = Math.PI;
let ballAngle = Math.random() * Math.PI;
let ballVelX = Math.cos(ballAngle);
let ballVelZ = Math.sin(ballAngle);
let ballVel = 0.01;
let oneOverFps = 0.0001;

function setPixel(x, y, r, g, b) {
  const index = (x + y * width) * 4;
  pixels[index] = r;
  pixels[index + 1] = g;
  pixels[index + 2] = b;
  return (r << 16) | (g << 8) | b;
}

const discIntersect = (
  rayDirectionx,
  rayDirectiony,
  rayDirectionz,
  rayPositionx,
  rayPositiony,
  rayPositionz,
  pointx,
  pointy,
  pointz,
  normalx,
  normaly,
  normalz,
  radiusSquared
) => {
  let paralell =
    rayDirectionx * normalx + rayDirectiony * normaly + rayDirectionz * normalz;

  if (paralell > -0.000001 && paralell < 0.000001) {
    return 0;
  }

  let t =
    normalx * (pointx - rayPositionx) +
    normaly * (pointy - rayPositiony) +
    normalz * (pointz - rayPositionz);
  t /= paralell;
  let hitPointx = rayPositionx + rayDirectionx * t;
  let hitPointy = rayPositiony + rayDirectiony * t;
  let hitPointz = rayPositionz + rayDirectionz * t;
  let lenght =
    (hitPointx - pointx) * (hitPointx - pointx) +
    (hitPointy - pointy) * (hitPointy - pointy) +
    (hitPointz - pointz) * (hitPointz - pointz);
  if (lenght > radiusSquared) {
    return 0;
  }
  return t;
};

// intersectroutine for a sphere
const sphereIntersect = (
  rayDirectionx,
  rayDirectiony,
  rayDirectionz,
  rayPositionx,
  rayPositiony,
  rayPositionz,
  spherePositionx,
  spherePositiony,
  spherePositionz,
  sphereRadiusSquare
) => {
  let rayToCenterx = spherePositionx - rayPositionx;
  let rayToCentery = spherePositiony - rayPositiony;
  let rayToCenterz = spherePositionz - rayPositionz;

  let isInfront =
    rayToCenterx * rayDirectionx +
    rayToCentery * rayDirectiony +
    rayToCenterz * rayDirectionz;
  if (isInfront < 0.0000001) return 0;

  let dist2 =
    rayToCenterx * rayToCenterx +
    rayToCentery * rayToCentery +
    rayToCenterz * rayToCenterz;
  let hc2 = sphereRadiusSquare - (dist2 - isInfront * isInfront);
  if (hc2 < 0.0000001) return 0;

  let t = isInfront - Math.sqrt(hc2);

  return t;
};

let now = performance.now();
let timeAccum = { time: 0, frames: 0 };
const update = (_) => {
  let current = performance.now();
  oneOverFps = (current - now) / 66;

  timeAccum.frames++;
  timeAccum.time += current - now;
  if (timeAccum.frames > 100) {
    frameRateEl.innerText = `${(timeAccum.time / timeAccum.frames) | 0}ms`;
    timeAccum.frames = 0;
    timeAccum.time = 0;
  }
  now = current;

  let tangle = paddle1Angle - paddle2Angle;

  if (keys["KeyA"]) {
    tangle = tangle + 0.05 * oneOverFps;
    tangle *= tangle;
    if (tangle > 0.3) {
      paddle1Angle += 0.05 * oneOverFps;
      if (paddle1Angle > 6.283185) {
        paddle1Angle -= 6.283185;
      }
    } else {
      paddle1Angle -= 0.3 - tangle;
    }
  } else if (keys["KeyD"]) {
    tangle = tangle - 0.05 * oneOverFps;
    tangle *= tangle;
    if (tangle > 0.3) {
      paddle1Angle -= 0.05 * oneOverFps;
      if (paddle1Angle < 0) {
        paddle1Angle += 6.283185;
      }
    } else {
      paddle1Angle += 0.3 - tangle;
    }
  }
  tangle = paddle1Angle - paddle2Angle;
  if (keys["ArrowLeft"]) {
    tangle = tangle - 0.05 * oneOverFps;
    tangle *= tangle;
    if (tangle > 0.3) {
      paddle2Angle -= 0.05 * oneOverFps;
      if (paddle2Angle < 0) {
        paddle2Angle += 6.283185;
      }
    } else {
      paddle2Angle += 0.3 - tangle;
    }
  } else if (keys["ArrowRight"]) {
    tangle = tangle + 0.05 * oneOverFps;
    tangle *= tangle;
    if (tangle > 0.3) {
      paddle2Angle += 0.05 * oneOverFps;
      if (paddle2Angle > 6.283185) {
        paddle2Angle -= 6.283185;
      }
    } else {
      paddle2Angle -= 0.3 - tangle;
    }
  }

  bollPositionx += ballVelX * ballVel * oneOverFps;
  bollPositionz += ballVelZ * ballVel * oneOverFps;
  if (bollPositionx * bollPositionx + bollPositionz * bollPositionz > 1.75) {
    ballAngle = Math.random() * Math.PI;
    ballVelX = Math.cos(ballAngle);
    ballVelZ = Math.sin(ballAngle);
    bollPositionx = bollPositionz = 0;
    ballVel = 0.01;
    if (bollRed > 0.5) {
      redScore++;
      scoreEl.innerText = `Red: ${redScore} - Green: ${greenScore}`;
    } else if (bollBlue < 0.5) {
      greenScore++;
      scoreEl.innerText = `Red: ${redScore} - Green: ${greenScore}`;
    }
    bollRed = bollGreen = 0.3;
    bollBlue = 1;
  }

  // recalculate paddle positions and normals
  paddle1Normalx = paddle1Positionx = Math.cos(paddle1Angle);
  paddle1Normalz = paddle1Positionz = Math.sin(paddle1Angle);

  paddle2Normalx = paddle2Positionx = Math.cos(paddle2Angle);
  paddle2Normalz = paddle2Positionz = Math.sin(paddle2Angle);

  // check for collision ball->paddles
  let baal = discIntersect(
    ballVelX,
    0,
    ballVelZ,
    bollPositionx,
    0.75,
    bollPositionz,
    paddle1Positionx,
    0.75,
    paddle1Positionz,
    paddle1Normalx,
    0,
    paddle1Normalz,
    0.09
  );
  if (baal > 0 && baal < 0.1) {
    let temp1 = -(paddle1Normalx * ballVelX + paddle1Normalz * ballVelZ) * 2;
    let reflx = paddle1Normalx * temp1 + ballVelX;
    let reflz = paddle1Normalz * temp1 + ballVelZ;
    let l = 1 / Math.sqrt(reflx * reflx + reflz * reflz);

    ballVelX = reflx * l;
    ballVelZ = reflz * l;
    if (ballVel < 0.1) {
      ballVel += 0.01;
    }
    bollRed = 1;
    bollGreen = bollBlue = 0;
  }
  baal = discIntersect(
    ballVelX,
    0,
    ballVelZ,
    bollPositionx,
    0.75,
    bollPositionz,
    paddle2Positionx,
    0.75,
    paddle2Positionz,
    paddle2Normalx,
    0,
    paddle2Normalz,
    0.09
  );
  if (baal > 0 && baal < 0.1) {
    let temp1 = -(paddle2Normalx * ballVelX + paddle2Normalz * ballVelZ) * 2;
    let reflx = paddle2Normalx * temp1 + ballVelX;
    let reflz = paddle2Normalz * temp1 + ballVelZ;
    let l = 1 / Math.sqrt(reflx * reflx + reflz * reflz);

    ballVelX = reflx * l;
    ballVelZ = reflz * l;
    if (ballVel < 0.1) {
      ballVel += 0.01;
    }
    bollRed = bollBlue = 0;
    bollGreen = 1;
  }
};

const shade = (
  hitPointx,
  hitPointy,
  hitPointz,
  normalx,
  normaly,
  normalz,
  red,
  green,
  blue,
  reflection,
  rayDirectionx,
  rayDirectiony,
  rayDirectionz,
  depth
) => {
  // the light
  let l =
    1 /
    Math.sqrt(
      hitPointx * hitPointx +
        (3 - hitPointy) * (3 - hitPointy) +
        hitPointz * hitPointz
    );
  let lightVectorx = -hitPointx * l;
  let lightVectory = (3 - hitPointy) * l;
  let lightVectorz = -hitPointz * l;

  // Shadow algo
  let lightRayx = hitPointx + normalx * 0.01;
  let lightRayy = hitPointy + normaly * 0.01;
  let lightRayz = hitPointz + normalz * 0.01;

  let inShadow =
    discIntersect(
      lightVectorx,
      lightVectory,
      lightVectorz,
      lightRayx,
      lightRayy,
      lightRayz,
      paddle1Positionx,
      0.75,
      paddle1Positionz,
      paddle1Normalx,
      0,
      paddle1Normalz,
      0.09
    ) > 0;

  inShadow =
    inShadow ||
    discIntersect(
      lightVectorx,
      lightVectory,
      lightVectorz,
      lightRayx,
      lightRayy,
      lightRayz,
      paddle2Positionx,
      0.75,
      paddle2Positionz,
      paddle2Normalx,
      0,
      paddle2Normalz,
      0.09
    ) > 0;

  inShadow =
    inShadow ||
    sphereIntersect(
      lightVectorx,
      lightVectory,
      lightVectorz,
      lightRayx,
      lightRayy,
      lightRayz,
      bollPositionx,
      0.75,
      bollPositionz,
      0.01
    ) > 0;

  if (!inShadow) {
    // diffuse
    let diffuse =
      normalx * lightVectorx + normaly * lightVectory + normalz * lightVectorz;

    if (diffuse < 0) {
      return 0;
    }
    let rr = red * diffuse;
    let gg = green * diffuse;
    let bb = blue * diffuse;

    // reflection
    if (depth && reflection) {
      let temp1 =
        -(
          normalx * rayDirectionx +
          normaly * rayDirectiony +
          normalz * rayDirectionz
        ) * 2;
      let reflx = normalx * temp1 + rayDirectionx;
      let refly = normaly * temp1 + rayDirectiony;
      let reflz = normalz * temp1 + rayDirectionz;
      let rl = 1 / Math.sqrt(reflx * reflx + refly * refly + reflz * reflz);
      let reflc = traceRay(
        reflx * rl,
        refly * rl,
        reflz * rl,
        hitPointx + reflx * 0.01,
        hitPointy + refly * 0.01,
        hitPointz + reflz * 0.01,
        false
      );
      bb += (reflc & 0xff) * 0.001;
      gg += ((reflc >> 8) & 0xff) * 0.001;
      rr += ((reflc >> 16) & 0xff) * 0.001;
    }

    // exposure
    return (
      (((rr / (rr + 0.666)) * 255) << 16) |
      (((gg / (gg + 0.666)) * 255) << 8) |
      ((bb / (bb + 0.666)) * 255)
    );
  }

  return 0;
};

const traceRay = (
  rayDirectionx,
  rayDirectiony,
  rayDirectionz,
  rayPositionx,
  rayPositiony,
  rayPositionz,
  depth
) => {
  // final color of the current ray
  let pixelColor = 0;
  {
    // loop through all objects and find closest intersection
    {
      let hp = -1;
      let cph = 10;
      let objectIntersected = -1;

      hp = discIntersect(
        rayDirectionx,
        rayDirectiony,
        rayDirectionz,
        rayPositionx,
        rayPositiony,
        rayPositionz,
        paddle1Positionx,
        0.75,
        paddle1Positionz,
        paddle1Normalx,
        0,
        paddle1Normalz,
        0.09
      );

      if (hp > 0 && hp < cph) {
        objectIntersected = 0;
        cph = hp;
      }

      hp = discIntersect(
        rayDirectionx,
        rayDirectiony,
        rayDirectionz,
        rayPositionx,
        rayPositiony,
        rayPositionz,
        paddle2Positionx,
        0.75,
        paddle2Positionz,
        paddle2Normalx,
        0,
        paddle2Normalz,
        0.09
      );

      if (hp > 0 && hp < cph) {
        objectIntersected = 1;
        cph = hp;
      }

      hp = sphereIntersect(
        rayDirectionx,
        rayDirectiony,
        rayDirectionz,
        rayPositionx,
        rayPositiony,
        rayPositionz,
        bollPositionx,
        0.75,
        bollPositionz,
        0.01
      );
      if (hp > 0 && hp < cph) {
        objectIntersected = 2;
        cph = hp;
      }

      hp = discIntersect(
        rayDirectionx,
        rayDirectiony,
        rayDirectionz,
        rayPositionx,
        rayPositiony,
        rayPositionz,
        0,
        0,
        0,
        0,
        1,
        0,
        2.25
      );
      if (hp > 0 && hp < cph) {
        objectIntersected = 3;
        cph = hp;
      }

      // if there is an intersection
      if (objectIntersected != -1) {
        let hitTx = rayPositionx + rayDirectionx * cph;
        let hitTy = rayPositiony + rayDirectiony * cph;
        let hitTz = rayPositionz + rayDirectionz * cph;
        if (objectIntersected == 0) {
          if (
            rayDirectionx * paddle1Normalx + rayDirectionz * paddle1Normalz >
            0
          ) {
            pixelColor = shade(
              hitTx,
              hitTy,
              hitTz,
              -paddle1Normalx,
              0,
              -paddle1Normalz,
              1,
              0.1,
              0.1,
              true,
              rayDirectionx,
              rayDirectiony,
              rayDirectionz,
              depth
            );
          }
        } else if (objectIntersected == 1) {
          if (
            rayDirectionx * paddle2Normalx + rayDirectionz * paddle2Normalz >
            0
          ) {
            pixelColor = shade(
              hitTx,
              hitTy,
              hitTz,
              -paddle2Normalx,
              0,
              -paddle2Normalz,
              0.1,
              1,
              0.1,
              true,
              rayDirectionx,
              rayDirectiony,
              rayDirectionz,
              depth
            );
          }
        } else if (objectIntersected == 2) {
          pixelColor = shade(
            hitTx,
            hitTy,
            hitTz,
            (hitTx - bollPositionx) * 10,
            (hitTy - 0.75) * 10,
            (hitTz - bollPositionz) * 10,
            bollRed,
            bollGreen,
            bollBlue,
            false,
            rayDirectionx,
            rayDirectiony,
            rayDirectionz,
            depth
          );
        } else {
          pixelColor = shade(
            hitTx,
            hitTy,
            hitTz,
            0,
            1,
            0,
            0.5,
            0.6,
            0.9,
            false,
            rayDirectionx,
            rayDirectiony,
            rayDirectionz,
            depth
          );
        }
      }
    }
  }

  // return the final color of the ray
  return pixelColor;
};

const init = (_) => {
  // generate primary rays
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let currentx = -1.1350278 + 0.0035533004 * x + 0.002051499 * y;
      let currenty = -0.169102 + -0.004102998 * y;
      let currentz = -0.4279209 + -0.0035533004 * x + 0.002051499 * y;
      let l =
        1 /
        Math.sqrt(
          currentx * currentx + currenty * currenty + currentz * currentz
        );
      pRays[x * 3 + y * width * 3] = currentx * l;
      pRays[x * 3 + y * width * 3 + 1] = currenty * l;
      pRays[x * 3 + y * width * 3 + 2] = currentz * l;
    }
  }

  document.addEventListener("keydown", ({ code }) => {
    if (code === "Space") {
      goGame = true;
    }

    if (goGame) {
      keys[code] = true;
    }
  });

  document.addEventListener("keyup", ({ code }) => {
    if (goGame) {
      keys[code] = false;
    }
  });

  scoreEl.innerText = `Red: ${redScore} - Green: ${greenScore}`;

  requestAnimationFrame(draw);
};

const getRBG = (c) => {
  return { b: c & 0xff, g: (c >> 8) & 0xff, r: (c >> 16) & 0xff };
};

const traceAndStore = (x, y) => {
  const { r, g, b } = getRBG(
    traceRay(
      pRays[x * 3 + y * width * 3],
      pRays[x * 3 + y * width * 3 + 1],
      pRays[x * 3 + y * width * 3 + 2],
      2,
      2,
      2,
      true
    )
  );
  return setPixel(x, y, r, g, b);
};

const draw = () => {
  // subsampling raytracing
  for (let y = 0; y <= height - 5; y += 5) {
    for (let x = 0; x <= width - 5; x += 5) {
      const d0 = traceAndStore(x, y);
      const d1 = traceAndStore(x + 4, y);
      const d2 = traceAndStore(x, y + 4);
      const d3 = traceAndStore(x + 4, y + 4);

      if (d0 + d1 + d2 + d3 === 0) {
        for (let j = 0; j < 5; j++) {
          for (let i = 0; i < 5; i++) {
            setPixel(x + i, y + j, 0, 0, 0);
          }
        }
      } else {
        const d4 = traceAndStore(x + 2, y);
        const d5 = traceAndStore(x, y + 2);
        const d6 = traceAndStore(x + 2, y + 2);
        const d7 = traceAndStore(x + 4, y + 2);
        const d8 = traceAndStore(x + 2, y + 4);

        if (d0 + d4 + d5 + d6 === 0) {
          setPixel(x + 1, y, 0, 0, 0);
          setPixel(x, y + 1, 0, 0, 0);
          setPixel(x + 1, y + 1, 0, 0, 0);
          setPixel(x + 2, y + 1, 0, 0, 0);
          setPixel(x + 1, y + 2, 0, 0, 0);
        } else {
          traceAndStore(x + 1, y);
          traceAndStore(x, y + 1);
          traceAndStore(x + 1, y + 1);
          traceAndStore(x + 2, y + 1);
          traceAndStore(x + 1, y + 2);
        }

        if (d1 + d4 + d6 + d7 === 0) {
          setPixel(x + 3, y, 0, 0, 0);
          setPixel(x + 3, y + 1, 0, 0, 0);
          setPixel(x + 3, y + 2, 0, 0, 0);
          setPixel(x + 4, y + 1, 0, 0, 0);
        } else {
          traceAndStore(x + 3, y);
          traceAndStore(x + 3, y + 1);
          traceAndStore(x + 3, y + 2);
          traceAndStore(x + 4, y + 1);
        }

        if (d2 + d5 + d6 + d8 === 0) {
          setPixel(x, y + 3, 0, 0, 0);
          setPixel(x + 1, y + 3, 0, 0, 0);
          setPixel(x + 2, y + 3, 0, 0, 0);
          setPixel(x + 1, y + 4, 0, 0, 0);
        } else {
          traceAndStore(x, y + 3);
          traceAndStore(x + 1, y + 3);
          traceAndStore(x + 2, y + 3);
          traceAndStore(x + 1, y + 4);
        }

        if (d3 + d6 + d7 + d8 === 0) {
          setPixel(x + 3, y + 2, 0, 0, 0);
          setPixel(x + 3, y + 3, 0, 0, 0);
          setPixel(x + 3, y + 4, 0, 0, 0);
          setPixel(x + 4, y + 3, 0, 0, 0);
        } else {
          traceAndStore(x + 3, y + 2);
          traceAndStore(x + 3, y + 3);
          traceAndStore(x + 3, y + 4);
          traceAndStore(x + 4, y + 3);
        }
      }

      if (goGame) {
        update();
      }
    }
  }
  // draw to the screen
  ctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(draw);
};

init();
