import { IMeasurement } from "./ecgmeasurements.js";
import { ECGViewer, ViewerAction } from "./ecgviewer.js";

window.addEventListener('DOMContentLoaded', (ev: Event) => {
    const eviewer = new ECGViewer('viewer', 'img/test.jpg');

    window.document.getElementById('zoom').addEventListener('change', (e: Event) => {
      eviewer.setZoomFactor(parseFloat((e.target as HTMLInputElement).value))
    })

    window.document.getElementById('calibX').addEventListener('click', (e: Event) => {
      eviewer.setViewerAction(ViewerAction.CALIB_X_REF);
    })

    window.document.getElementById('calibY').addEventListener('click', (e: Event) => {
      eviewer.setViewerAction(ViewerAction.CALIB_Y_REF);
    })

    window.document.getElementById('measureDist').addEventListener('click', (e: Event) => {
      eviewer.setViewerAction(ViewerAction.MEASURE_DIST_1);
    })

    eviewer.addEventListener('calibXFinished', (res: number) => {
      window.document.getElementById('pxPerMM').innerText = res.toString()
      return true
    })

    eviewer.addEventListener('calibYFinished', (res: number) => {
      window.document.getElementById('pxPerMV').innerText = res.toString()
      return true
    })

    eviewer.addEventListener('measurementsUpdated', (newMeasurement: IMeasurement) => {
      console.log(newMeasurement)
      return true
    })    
})