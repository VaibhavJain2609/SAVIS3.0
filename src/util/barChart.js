export default class barChart {
  constructor(canvasEle, datasets, translation) {
    this.zoomIn = false;
    Chart.defaults.global.defaultFontSize = 16;
    Chart.defaults.global.defaultFontStyle = 'bold';
    Chart.defaults.global.defaultFontColor = "black";
    this.chart = new Chart(canvasEle, {
      type: "bar",
      data: {
        labels: [],
        datasets: datasets
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
                max: 1,
                step: 0.1,
                beginAtZero: true,
                //fontColor: "black",
                //fontSize: "16"
              },
              scaleLabel: {
                display: true,
                labelString: translation.yAxisTitle,
                //fontColor: "black",
                //fontSize: "14"
              }
            }
          ],
          xAxes: [
            {
              barPercentage: 1.0,
              ticks: {
                minRotation: 45,
                maxRotation: 45,
                //fontColor: "black",
                //fontSize: "14"
              },
              scaleLabel: {
                display: true,
                labelString: translation.xAxisTitle,
                //fontColor: "black",
                //fontSize: "14"
              }
            }  
          ]
        },
        responsive: true,
        maintainAspectRatio: true/*,
        tooltips: {
          mode: "index",
          backgroundColor: "rgba(0,0,0,1.0)",
          callbacks: {
            title: function(tooltipItem, data) {
              let title = tooltipItem[0].xLabel || "";
              title += " heads";
              return title;
            },
            label: (tooltipItem, data) => {
              if (tooltipItem.datasetIndex !== 2) {
                return `${data.datasets[tooltipItem.datasetIndex].label} : ${
                  tooltipItem.yLabel
                }`;
              } else {
                return `${data.datasets[tooltipItem.datasetIndex].label} : ${
                  this.dataFromCalculation.noOfSelected
                }`;
              }
            }
          }
        }*/
      }
    });
  }

  setScale(floor, ceil){
    this.chart.options.scales.yAxes[0].ticks.min = floor;
    this.chart.options.scales.yAxes[0].ticks.max = ceil;
    this.chart.update()
  }

  clearChart(){
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.options.scales.yAxes[0].ticks.max = 1;
    this.chart.update();
  }

  updateChartData(labels, contElements){
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = contElements;
    /*const {
      labels,
      samples,
      binomail,
      selected,
      probability,
      noOfCoin,
      noOfSelected,
      mean,
      zoomIn
    } = dataSet;

    if (!zoomIn) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = samples;
      this.chart.data.datasets[1].data = binomail;
      this.chart.data.datasets[2].data = selected;
    } else {
      const roundedMean = Math.floor(probability * noOfCoin);
      const HALF_WIDTH = 25;
      let lowerRange, upperRange;
      if (roundedMean - HALF_WIDTH <= 0) {
        lowerRange = 0;
        upperRange = lowerRange + HALF_WIDTH * 2;
      } else if (roundedMean + HALF_WIDTH >= noOfCoin) {
        upperRange = noOfCoin + 1;
        lowerRange = upperRange - HALF_WIDTH * 2;
      } else {
        lowerRange = roundedMean - HALF_WIDTH;
        upperRange = roundedMean + HALF_WIDTH;
      }
      upperRange = lowerRange + HALF_WIDTH * 2;
      this.chart.data.labels = labels.slice(lowerRange, upperRange);
      this.chart.data.datasets[0].data = samples.slice(lowerRange, upperRange);
      this.chart.data.datasets[1].data = binomail.slice(lowerRange, upperRange);
      this.chart.data.datasets[2].data = selected.slice(lowerRange, upperRange);
    }

    // Se establece un nuevo máximo a la gráfica
    const maxElement = Math.max(...contElements);
    if (maxElement>=1) {
      if (maxElement<10)  this.setMaxScale(10);
      else if (maxElement<=100) this.setMaxScale(maxElement + ( 10 - (maxElement%10) ));
      else  this.setMaxScale(maxElement + ( 100 - (maxElement%100) ));
    }
    
    */
    this.chart.update();
/*
    this.dataFromCalculation.theoryMean = mean;
    this.dataFromCalculation.noOfSelected = noOfSelected;
    this.chart.mean = mean;
    this.chart.options.scales.xAxes[0].scaleLabel.labelString = `${
      this.translationData.noOfHeads
    } ${noOfCoin} ${this.translationData.tosses2}`;
    this.chart.update();*/
  }
}

/*
Chart.pluginService.register({
  id: "offsetBar",
  afterUpdate: function(chart) {
    // We get the dataset and set the offset here
    const dataset = chart.config.data.datasets[2];
    // const width = dataset._meta[0].data[1]._model.x - dataset._meta[0].data[0]._model.x;
    let offset;
    const meta = Object.values(dataset._meta)[0];
    if (meta.data.length > 0) {
      offset = -(meta.data[1]._model.x - meta.data[0]._model.x) / 2;
    }

    // For every data in the dataset ...
    for (var i = 0; i < meta.data.length; i++) {
      // We get the model linked to this data
      var model = meta.data[i]._model;
      // And add the offset to the `x` property
      model.x += offset;

      // .. and also to these two properties
      // to make the bezier curve fits the new graph
      model.controlPointNextX += offset;
      model.controlPointPreviousX += offset;
    }
  }
});

// Chart.pluginService.register({
//   id: "sampleBarColor",
//   beforeUpdate: function(chart) {
//     if (chart.mean) {
//       const chartData = chart.config.data; // sample dataset
//       chartData.datasets[0].backgroundColor = chartData.labels.map(
//         x =>
//           `rgba(255,0,0,${1 -
//             (Math.abs(x - chart.mean) * 1.2) / chartData.labels.length})`
//       );
//     }
//   }
// });

Chart.pluginService.register({
  id: "fixedSamplelegendColor",
  afterUpdate: function(chart) {
    chart.legend.legendItems[0].fillStyle = "rgba(255,0,0,0.8)";
  }
});

Chart.pluginService.register({
  id: "dynamicBubbleSize",
  beforeUpdate: function(chart) {
    if (chart.mean) {
      const chartData = chart.config.data; // sample dataset
      const dyanamicSize = 50 / chartData.labels.length;
      const minSize = 2;
      chartData.datasets[1].radius =
        dyanamicSize > minSize ? dyanamicSize : minSize;
    }
  }
});*/
