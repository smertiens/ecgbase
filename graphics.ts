export class Point2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  static distance(p1: Point2D, p2: Point2D): number {
    let d = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
    return d
  }
}

export class Point3D {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
}

export class Rect {
  pos: Point2D;
  w: number;
  h: number;

  constructor(x = 0, y = 0, w = 0, h = 0) {
    this.pos = new Point2D(x, y)
    this.w = w
    this.h = h
  }

  contains(point: Point2D): boolean {
    return (
      point.x >= this.pos.x &&
      point.y >= this.pos.y &&
      point.x <= this.pos.x + this.w &&
      point.y <= this.pos.y + this.h
    ) ? true : false;
  }

  getCenter():Point2D {
    return new Point2D(
      this.pos.x + (this.w / 2),
      this.pos.y + (this.h / 2)
    );
  }
}
