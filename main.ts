import { IMeasurement } from "./ecgmeasurements.js";
import { CalibrationResult, ECGViewer, ViewerAction } from "./ecgviewer.js";

window.addEventListener('DOMContentLoaded', (ev: Event) => {
    const eviewer = new ECGViewer('viewer', 'img/test.jpg');

    window.document.getElementById('zoom').addEventListener('change', (e: Event) => {
      eviewer.setZoomFactor(parseFloat((e.target as HTMLInputElement).value))
    })

    window.document.getElementById('calibX').addEventListener('click', (e: Event) => {
      eviewer.setViewerAction(ViewerAction.CALIB_X_REF);
    })

    window.document.getElementById('measureDist').addEventListener('click', (e: Event) => {
      eviewer.setViewerAction(ViewerAction.MEASURE_DIST_1);
    })

    eviewer.addEventListener('calibrationFinished', (res: CalibrationResult) => {
      console.log(res)
      window.document.getElementById('pxPerMM').innerText = res.pixelsPerMillisecond.toString()
      window.document.getElementById('pxPerMV').innerText = res.pixelsPerMillivolts.toString()
      return true
    })

    eviewer.addEventListener('measurementsUpdated', (newMeasurement: IMeasurement) => {
      console.log(newMeasurement)
      return true
    })    
})