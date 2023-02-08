import { INFINITESIMO } from "./constants.js";

export function calculateAngle(xj, xi, zj, zi) {
  return Math.atan2(xj - xi, zj - zi) + Math.PI;
}

export function calculateGap(yj, yi) {
  return yj - yi;
}

export function calculateInclination(h, p) {
  return Math.atan2(h, p);
}

export function calculatelengthOfTheProjection(
  xj,
  xi,
  zj,
  zi,
  lengthi,
  lengthj
) {
  return (
    Math.sqrt(Math.pow(xj - xi, 2) + Math.pow(zj - zi, 2)) - lengthi - lengthj
  );
}

export function calculateLengthRoad(h, p) {
  return Math.sqrt(Math.pow(p, 2) + Math.pow(h, 2));
}

export function calculateMediumPoint(r1, r2) {
  return {
    x: (r1.x + r2.x) / 2,
    y: (r1.y + r2.y) / 2 - INFINITESIMO,
    z: (r1.z + r2.z) / 2,
  };
}

export function calucalteNewPointInCircle(coordinate,speed,dir){
 return coordinate + speed * Math.cos(dir);
}

export function verifyPointBelongToCircle(xp,xi,yp,yi,r){
  return Math.pow(xp-xi,2) + Math.pow(yp-yi,2) <= Math.pow(r,2);
}

export function calculateNewZ(z){
  //0.5 é a altura do personagem, mudar depois
  return z + 0.5/2.0;
}

export function calucalteNewPointInEL(xp,xi,yp,yi,alpha){
  return {
    x: (xp-xi) * Math.cos(alpha) + (yp-yi)*Math.sin(alpha),
    y: (yp-yi) * Math.cos(alpha) + (xp-xi)*Math.sin(alpha),
  };
 }

 export function calculateNewZInArch(z,x,s,p,h){
  //0.5 é a altura do personagem, mudar depois
  return z + (x - s) / p* h + ALTURA_PERSONAGEM / 2.0;
}