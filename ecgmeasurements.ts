enum MeaurementType {
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

interface IMeasurement {}

class Measurement implements IMeasurement {
  type: MeaurementType
  unit: MeasurementUnit
  label = ''
}

class Distance extends Measurement {
  distance = 0

  constructor(dist: number, unit: MeasurementUnit) {
    super()
    this.type = MeaurementType.DISTANCE
    this.distance = dist
    this.unit = unit
  }
}

class Radius extends Measurement {
  constructor(center: number, r: number) {
    super()
    this.type = MeaurementType.RADIUS
  }
}

export { MeaurementType, Distance, Radius, IMeasurement, MeasurementUnit }