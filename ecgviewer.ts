import { Point2D } from "./graphics.js"
import { EventBase } from './events.js'
import { Distance, IMeasurement, MeasurementUnit, MeasurementType } from "./ecgmeasurements.js";

enum MouseButtonPressedState {
  NONE_PRESSED,
  LEFT_PRESSED,
  RIGHT_PRESSED,
  MIDDLE_PRESSED
};

export enum ViewerAction {
  NONE,
  CALIB_X_REF,
  CALIB_X_MEASURE,
  MEASURE_DIST_1,
  MEASURE_DIST_2,
  SELECT
};

export enum PaperSpeed {
  MM50,
  MM25
}

export class CalibrationResult {
  public pixelsPerMillisecond: number
  public pixelsPerMillivolts: number

  constructor(pixelsPerMS: number, pixelsPerMV: number) {
    this.pixelsPerMillisecond = pixelsPerMS
    this.pixelsPerMillivolts = pixelsPerMV
  }
}

const SMOOTHING = 1;

export class ECGViewer extends EventBase {

  canvas: HTMLCanvasElement;
  img: HTMLImageElement;

  zoomFactor: number = 1;

  mousePos: Point2D = new Point2D(0, 0);
  anchorPos: Point2D = new Point2D(0, 0);
  scrollPos: Point2D = new Point2D(0, 0);
  bgDragStartPos: Point2D = new Point2D(0, 0);
  mouseDownPos: Point2D = new Point2D(0, 0);
  mouseButton: MouseButtonPressedState;
  currentViewerAction: ViewerAction = ViewerAction.NONE;
  paperSpeed = PaperSpeed.MM50


  kbModifiers = {
    ALT: false,
    SHIFT: false,
    CTRL: false
  }

  pixelsPerMillisecond = 0
  pixelsPerMillivolts = 0
  millimetersPerSecond = 50

  currentMeasurementData: IMeasurement
  measurements: IMeasurement[] = []

  constructor(id: string, imgPath: string) {
    super()

    this.canvas = window.document.getElementById(id) as HTMLCanvasElement;
    this.mouseButton = MouseButtonPressedState.NONE_PRESSED;

    window.document.addEventListener('keydown', (ev: KeyboardEvent) => {
      this.kbModifiers = {
        ALT: ev.altKey,
        SHIFT: ev.shiftKey,
        CTRL: ev.ctrlKey
      }
    })

    window.document.addEventListener('keyup', (ev: KeyboardEvent) => {
      this.kbModifiers = {
        ALT: ev.altKey,
        SHIFT: ev.shiftKey,
        CTRL: ev.ctrlKey
      }
    })

    this.canvas.addEventListener('mousedown', (ev: MouseEvent) => {
      this.mouseDownPos.x = ev.clientX - this.canvas.getBoundingClientRect().left
      this.mouseDownPos.y = ev.clientY - this.canvas.getBoundingClientRect().top
      
      this.bgDragStartPos.x = this.scrollPos.x;
      this.bgDragStartPos.y = this.scrollPos.y;
      this.mouseButton = MouseButtonPressedState.LEFT_PRESSED;

      switch(this.currentViewerAction) {
        case ViewerAction.CALIB_X_REF: {
          this.anchorPos = new Point2D(
            ev.clientX - this.canvas.getBoundingClientRect().left,
            ev.clientY - this.canvas.getBoundingClientRect().top
          )
          
          this.setViewerAction(ViewerAction.CALIB_X_MEASURE)
          break
        }

        case ViewerAction.CALIB_X_MEASURE: {
          let factor = (this.paperSpeed == PaperSpeed.MM25 ? 200 : 100)
          console.log(Math.abs(this.anchorPos.x - this.mouseDownPos.x))
          this.pixelsPerMillisecond = factor / Math.abs(this.anchorPos.x - this.mouseDownPos.x)
          this.pixelsPerMillivolts = Math.abs(this.anchorPos.y - this.mouseDownPos.y) / 2

          this.setViewerAction(ViewerAction.NONE)
          this.emit('calibrationFinished', new CalibrationResult(this.pixelsPerMillisecond, this.pixelsPerMillivolts))
          break
        }

        case ViewerAction.MEASURE_DIST_1: {
          this.anchorPos = new Point2D(
            ev.clientX - this.canvas.getBoundingClientRect().left,
            ev.clientY - this.canvas.getBoundingClientRect().top
          )
          
          this.setViewerAction(ViewerAction.MEASURE_DIST_2)
          break
        }

        case ViewerAction.MEASURE_DIST_2: {
          /*let d_px = Point2D.distance(
            this.currentMeasurementData.start,
            this.currentMeasurementData.end,
          )
          
          let newMeasurement = new Distance(this.currentMeasurementData.start, this.currentMeasurementData.end, MeasurementUnit.MILLISECONDS)
          */
          this.measurements.push(this.currentMeasurementData)
          this.emit('measurementsUpdated', this.currentMeasurementData)
          this.setViewerAction(ViewerAction.NONE)
          break
        }
      }
    });

    this.canvas.addEventListener('mouseup', (ev: MouseEvent) => {
      this.mouseButton = MouseButtonPressedState.NONE_PRESSED;
    })

    this.canvas.addEventListener('mousemove', (ev: MouseEvent) => {
      this.mousePos = new Point2D(
        ev.clientX - this.canvas.getBoundingClientRect().left,
        ev.clientY - this.canvas.getBoundingClientRect().top
      )

      console.log(this.mousePos)
    
      if (this.mouseButton == MouseButtonPressedState.LEFT_PRESSED) {
        this.scrollPos.x = ev.clientX - this.canvas.getBoundingClientRect().left - this.mouseDownPos.x + this.bgDragStartPos.x
        this.scrollPos.y = ev.clientY - this.canvas.getBoundingClientRect().top - this.mouseDownPos.y + this.bgDragStartPos.y
      }
      
      this.paint()
    })

    this.img = new Image()
    this.img.src = imgPath

    this.img.addEventListener('load', () => {
      this.paint();
    })
  }

  setZoomFactor(factor: number) {
    this.zoomFactor = factor;
    this.paint();
  }

  setViewerAction(action: ViewerAction) {
    this.currentViewerAction = action;
  }

  getMeasurements(): IMeasurement[] {
    return this.measurements
  }

  getPixelDistanceAsMS(dist: number): number {
    return dist * this.pixelsPerMillisecond
  }

  paint() {
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight)

    ctx.drawImage(this.img, this.scrollPos.x, this.scrollPos.y, this.img.width * this.zoomFactor, 
        this.img.height * this.zoomFactor)

    for (let m of this.measurements) {
      this.paintMeasurement(m)
    }
      
    switch (this.currentViewerAction) {
      case  ViewerAction.CALIB_X_MEASURE: {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        
        ctx.beginPath()
        ctx.rect(
          this.anchorPos.x, this.anchorPos.y,
          this.mousePos.x - this.anchorPos.x,
          this.mousePos.y - this.anchorPos.y,
        )
        ctx.stroke()

        break
      }

      case ViewerAction.MEASURE_DIST_2: {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        const markerHeight = 50

        let start = new Point2D(this.anchorPos.x, this.anchorPos.y)
        let end

        if (this.kbModifiers.ALT) {
          end = new Point2D(this.mousePos.x, start.y)
        } else {
          end = new Point2D(this.mousePos.x, this.mousePos.y)
        }

        this.currentMeasurementData = new Distance(start, end, MeasurementUnit.MILLISECONDS)
        this.paintMeasurement(this.currentMeasurementData)
        break
      }
    }
  }

  private paintMeasurement(data: IMeasurement): void {
    // TODO: add bg position
    const ctx = this.canvas.getContext('2d')
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2;
    const markerHeight = 50

    switch (data.type) {
      case MeasurementType.DISTANCE:
        let dist = <Distance> data
        ctx.beginPath();

        // marker start
        ctx.moveTo(dist.start.x + this.scrollPos.x, dist.start.y  + this.scrollPos.y - markerHeight / 2)
        ctx.lineTo(dist.start.x + this.scrollPos.x, dist.start.y  + this.scrollPos.y + markerHeight / 2)
        ctx.stroke()

        // marker end
        ctx.moveTo(dist.end.x + this.scrollPos.x, dist.end.y  + this.scrollPos.y - markerHeight / 2)
        ctx.lineTo(dist.end.x + this.scrollPos.x, dist.end.y  + this.scrollPos.y + markerHeight / 2)
        ctx.stroke()

        // measurement line
        ctx.moveTo(dist.start.x + this.scrollPos.x, dist.start.y + this.scrollPos.y)
        ctx.lineTo(dist.end.x + this.scrollPos.x, dist.end.y + this.scrollPos.y)
        ctx.stroke()
        break
    }
  }
}