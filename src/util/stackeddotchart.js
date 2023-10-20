// TODO(matthewmerrill): don't CDN
//import Chart from "chart.js";
/*


*/
export default class StackedDotChart {
  constructor(domElement, datasets, options) {
    this.domElement = domElement;
    this.datasets = [];
    for (let dataset of datasets) {
      this.datasets.push(
        Object.assign({}, dataset, {
          pointRadius: 8
        })
      );
    }

    Chart.defaults.global.defaultFontSize = 16;
    Chart.defaults.global.defaultFontStyle = 'bold';
    Chart.defaults.global.defaultFontColor = "black";
    this.chart = new Chart(domElement, {
      type: "scatter",
      data: {
        datasets: this.datasets
      },
      options: {
        scales: {
          xAxes: [{ 
            ticks: { 
              //beginAtZero: true,
              fontColor: 'black',
              fontSize: 16,
              padding: 0,
              min: 0,
              max: 1 
            },
            scaleLabel: {
              display: true,
              labelString: "",
              //fontColor: "black",
              //fontSize: "14"
            }
          }],
          yAxes: [
            {
              ticks: {
                fontColor: 'black',
                fontSize: 16,
                padding: 0,
                /*min: 1, // Original
                max:2,*/
                min: 0, // Rafael Diaz
                stepSize: 1
              },
              scaleLabel: {
                display: true,
                labelString: "",
                //fontColor: "black",
                //fontSize: "14"
              }
            }
          ]
        },
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgba(0,0,0,1.0)",
          bodyFontStyle: 16
        }
      }
    });
    options = options || {};
    this.options = {
      autoBuckets: options.autoBuckets !== undefined ? options.autoBuckets : true,
      bucketWidth: options.bucketWidth,
    };
  }

  round(x, bucketSize) {
    if (bucketSize == undefined) {
      if (this.options.autoBuckets) {
        let scale = this.chart.scales['x-axis-1'];
        let inScaleWidth = scale.options.ticks.max - scale.options.ticks.min;
        let chartWidth = this.chart.width;
        let pointRadius = this.chart.data.datasets[0].pointRadius;
        bucketSize = Math.round(2 * pointRadius * (inScaleWidth / chartWidth), 4);
      }
      else if (this.options.bucketWidth) {
        bucketSize = this.bucketWidth;
      }
    }
    if (bucketSize) {
      let r = Math.floor(x / bucketSize) * bucketSize;
      return r;
    }
    else {
      return x;
    }
  }

  rawToScatter(arrs) {
    let faceted = [];
    let counts = {};
    for (let arr of arrs) {
      let scatter = [];
      for (let item of arr) {
        //item = this.round(item);
        //item = Math.round(item);
        let y = (counts[item] = (counts[item] || 0) + 1);
        scatter.push({ x: item, y: y/*, n:*/ });
      }
      faceted.push(scatter);
    }
    return faceted;
  }

  clear() {
    for (let dataset of this.chart.data.datasets) {
      dataset.data = [];
    }
    this.chart.options.scales.xAxes[0].ticks.min = 0;
    this.chart.options.scales.xAxes[0].ticks.max = 1;
    //this.chart.options.scales.yAxes[0].ticks.max = 2;
  }

  setDataFromRaw(rawDataArrays) {
    let scatterArrays = this.rawToScatter(rawDataArrays);
    for (let idx = 0; idx < rawDataArrays.length; idx++) {
      this.chart.data.datasets[idx].data = scatterArrays[idx];
    }
    let max = 1;
    for (let dataset of scatterArrays) {
      for (let item of dataset) {
        max = Math.max(max, item.y);
      }
    }
    /*this.chart.options.scales.yAxes[0].ticks.stepSize = Math.pow(
      10,
      Math.floor(Math.log10(max))
    );*/
  }

  setScale(start, end) {
    //this.chart.options.scales.xAxes[0].ticks.min = this.round(start);
    //this.chart.options.scales.xAxes[0].ticks.max = 2*end - this.round(end);
    // CAMBIOS 09/07/2023
    // - Solicitado por FELIPE TUZ PARA QUE NO SE AMONTONEN BASTANTES PUNTOS
    // REMOVIDO A PETICION DE RAFAEL DIAZ
    //this.chart.options.scales.xAxes[0].ticks.min = (start%1 === 0)? start-1 : Math.floor(start);
    //this.chart.options.scales.xAxes[0].ticks.max = (end%1 === 0)? end+1 : Math.ceil(end);
    this.chart.options.scales.xAxes[0].ticks.min = (Math.floor(start))? Math.floor(start) : 0;
    this.chart.options.scales.xAxes[0].ticks.max = Math.ceil(end) + 1;


  }

  setAxisLabels(xLabel, yLabel){
    this.chart.options.scales.xAxes[0].scaleLabel.labelString = xLabel;
    this.chart.options.scales.yAxes[0].scaleLabel.labelString = yLabel;
  }

  /**
   * Attempts to scale y dimension to make the dots stack directly on top of
   * each other. If there is not enough space in the chart to do so, the y will
   * scale to contain all the dots, squishing them to clip into each other.
   * When there are many dots, this makes the stack look like a vertical bar.
   */
  scaleToStackDots() {
    // TODO(matthewmerrill): memoize getMax with a dirty flag
    let max = 1;
    for (let dataset of this.chart.data.datasets) {
      for (let item of dataset.data) {
        max = Math.max(max, item.y);
      }
    }
    
    // Cambios 09/07/2023
    /*const step =  Math.ceil((max - 1) * 0.2)
    const fuStep = function (num, div) {
      for (let it = 0; !(num%div); it++) div+=1;
      return div;
    }*/
    //this.chart.options.scales.yAxes[0].ticks.stepSize = max //? fuStep(max, step) : 1;  //09/07/2023
    
    // Cambios 13/08/2023
    // Por solicitud de LUCÍ, se cambia el tamaño de los pasos del eje Y
    this.chart.options.scales.yAxes[0].ticks.stepSize = (max>10)? Math.ceil(max * 0.2) : 1;
    if (max>1000)  this.chart.options.scales.yAxes[0].ticks.min = 0
    //let { top, bottom } = this.chart.chartArea;
    //let chartHeight = bottom - top;
    //let pointRadius = this.chart.data.datasets[0].pointRadius;
    /*if (max<10) this.chart.options.scales.yAxes[0].ticks.max = 10;
    else if (max<=100) this.chart.options.scales.yAxes[0].ticks.max = max + ( 10 - (max%10) );
    else this.chart.options.scales.yAxes[0].ticks.max = max + ( 100 - (max%100) );
    this.chart.options.scales.yAxes[0].ticks.max = Math.max(
      max,
      this.chart.options.scales.yAxes[0].ticks.min +
        (chartHeight / pointRadius) * 0.5
    );*/
  }

  updateLabelName(datasetIndex, labelName) {
    this.datasets[datasetIndex].label = labelName;
  }

  changeDotAppearance(pointRadius, stepSize) {
    this.chart.data.datasets.forEach(x => {
      x.pointRadius = pointRadius;
    });
    /*this.chart.options.scales.yAxes.forEach(x => {
      x.ticks.stepSize = stepSize;
    });*/
  }
  setAnimationDuration(duration) {
    this.chart.options.animation.duration = duration;
  }


}
