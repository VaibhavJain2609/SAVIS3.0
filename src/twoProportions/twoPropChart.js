---
---
import translation from "{{base}}../util/translate.js";
import {roundToPlaces} from "{{base}}../util/math.js";

export default class TwoPropChart {
  
  constructor(canvas) {
    this.dom = {canvas};
    if (!canvas) {
      throw new Error('canvas is undefined!');
    }
    // TODO(matthewmerrill): better tooltips
    // TODO(matthewmerrill): make the red/green more intuitive with how data is entered
    //  Note: This might require ChartJS v3.0.0 https://github.com/mendix/ChartJS/issues/31

    Chart.defaults.global.defaultFontSize = 16;
    Chart.defaults.global.defaultFontStyle = 'bold';
    Chart.defaults.global.defaultFontColor = "black";

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: [translation.twoProportions.groupA, translation.twoProportions.groupB],
        datasets: [
          {
            label: '% ' + translation.twoProportions.successes,
            backgroundColor: 'green',
            data: [0, 0],
          },
          {
            label: '% ' + translation.twoProportions.failures,
            backgroundColor: 'red',
            data: [0, 0],
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              //stacked: true,
              ticks: {
                max: 100,
              },
            }
          ],
          yAxes: [
            {
              id: 'groupAAxis',
              //stacked: true,
              ticks: {
                max: 100,
              },
              scaleLabel: {
                display: true,
                labelString: translation.twoProportions.yAxisTitle1
              }
            },
          ],
        }, 
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          mode: 'index',
          backgroundColor: "rgba(0,0,0,1.0)",
          callbacks: {
            title: function(tooltipItem, data) {
              let title = tooltipItem[0].xLabel || "";
              //title += " heads";
              return title;
            },
            label: (tooltipItem, data) => {
              return tooltipItem.yLabel+data.datasets[tooltipItem.datasetIndex].label;
            }
          }
        }
      },
    });
  }

  setProportions({ numASuccess, numAFailure, numBSuccess, numBFailure }) {
    let totalInA = numASuccess + numAFailure;
    let totalInB = numBSuccess + numBFailure;
    let totalSuccess = numASuccess + numBSuccess;
    let totalFailure = numAFailure + numBFailure;
    this.chart.data.datasets[0].data[0] = roundToPlaces(100 * numASuccess / totalInA, 2);
    this.chart.data.datasets[0].data[1] = roundToPlaces(100 * numBSuccess / totalInB, 2);
    this.chart.data.datasets[1].data[0] = roundToPlaces(100 * numAFailure / totalInA, 2);
    this.chart.data.datasets[1].data[1] = roundToPlaces(100 * numBFailure / totalInB, 2);
  }

  update() {
    this.chart.update();
  }

}
