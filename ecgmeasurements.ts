import { Point2D } from "./graphics.js"

enum MeasurementType {
  DISTANCE,
  RADIUS,
  ANGLE
}

enum MeasurementUnit {
  MILLIMETER,
  CENTIMETER,
  MILLISECONDS,
  MILLIVOLTS
}

interface IMeasurement {
  type: MeasurementType
}

class Measurement implements IMeasurement {
  type: MeasurementType
  unit: MeasurementUnit
  label = ''
}

class Distance extends Measurement {
  start: Point2D
  end: Point2D

  constructor(start: Point2D, end: Point2D, unit: MeasurementUnit) {
    super()
    this.type = MeasurementType.DISTANCE
    this.start = start
    this.end = end
    this.unit = unit
  }

  getDistance(): number {
    return Point2D.distance(this.start, this.end)
  }
}

class Radius extends Measurement {
  constructor(center: number, r: number) {
    super()
    this.type = MeasurementType.RADIUS
  }
}

export { MeasurementType, Distance, Radius, IMeasurement, MeasurementUnit }