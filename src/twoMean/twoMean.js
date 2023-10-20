---
---
import {
  dropTextFileOnTextArea,
  // TODO(matthewmerrill): use these library functions
  parseCSVtoSingleArray,
  readLocalFile,
  enableUploadDataFile
} from "{{base}}../util/csv.js";
import StackedDotChart from '{{base}}../util/stackeddotchart.js';
import TailChart from "{{base}}../util/tailchart.js";
import * as MathUtil from '{{base}}../util/math.js';
import * as Summaries from "{{base}}../util/summaries.js";
import { randomSubset } from '{{base}}../util/sampling.js';
import translation from "{{base}}../util/translate.js";
import { colorGen } from "{{base}}../util/color-code.js";

export class TwoMean {
  constructor(twoMeanDiv) {
    this.twoMeanDiv = twoMeanDiv;
    this.csvInput = twoMeanDiv.querySelector('#csv-input');
    this.data = undefined;
    this.sampleDiffs = [];
    this.diffData = {};
    this.summaryElements = Summaries.loadSummaryElements(twoMeanDiv);
    this.colorsArray = [[], []];
    this.colorArr1 = [];
    this.colorArr2 = []; 

    this.dom = {
      sampleSelect: twoMeanDiv.querySelector('#sample-select'),
      /*tailDirectionElement: twoMeanDiv.querySelector('#tail-direction'),
      tailInputElement: twoMeanDiv.querySelector('#tail-input'),*/
      needData: twoMeanDiv.querySelectorAll('[disabled=need-data]'),
      needResults: twoMeanDiv.querySelectorAll('[disabled=need-results]'),
      uploadbtn: twoMeanDiv.querySelector("#upload-btn"),
      fileInput: twoMeanDiv.querySelector("#fileInput"),
      /*minIntervalInput: twoMeanDiv.querySelector('#min-MeanTab'),
      maxIntervalInput: twoMeanDiv.querySelector('#max-MeanTab'),*/
      minTailValInput:  twoMeanDiv.querySelector("#min-tailValue"),
      maxTailValInput:  twoMeanDiv.querySelector("#max-tailValue"),
      includeValMin:    twoMeanDiv.querySelector("#includeMin"),
      includeValMax:    twoMeanDiv.querySelector("#includeMax")/*,
      chosensampleMeans:    twoMeanDiv.querySelector("#chosen-sample-means"),
      unchosensampleMeans:  twoMeanDiv.querySelector("#unchosen-sample-means")*/
    };
    enableUploadDataFile(this.dom.uploadbtn, this.dom.fileInput, this.csvInput)

    this.datasets = [
      { label: translation.twoMean.group1, backgroundColor: [], data: [] },
      { label: translation.twoMean.group2, backgroundColor: [], data: [] },
    ];
    this.dataChart1 = new StackedDotChart(twoMeanDiv.querySelector('#data-chart-1'), [this.datasets[0]]);
    this.dataChart2 = new StackedDotChart(twoMeanDiv.querySelector('#data-chart-2'), [this.datasets[1]]);
    this.sampleChart1 = new StackedDotChart(twoMeanDiv.querySelector('#sample-chart-1'), this.datasets);
    this.sampleChart1.chart.options.legend.display = false;
    this.sampleChart1.setAnimationDuration(0);
    this.sampleChart2 = new StackedDotChart(twoMeanDiv.querySelector('#sample-chart-2'), this.datasets);
    this.sampleChart2.chart.options.legend.display = false;
    this.sampleChart2.setAnimationDuration(0);
    // TODO(matthewmerrill): move other charts into here
    this.charts = {
      tailChart: new TailChart({
        chartElement: twoMeanDiv.querySelector('#diff-chart'),
        whatAreWeRecording: translation.twoMean.differences,
        summaryElements: this.summaryElements,
      }),
    };

    [this.dataChart1, this.dataChart2, this.sampleChart1, this.sampleChart2].forEach(
      (plt, idx) => {
        plt.chart.options.scales.xAxes[0].scaleLabel.labelString = (idx<2)
        ? translation.twoMean.xAxisTitle1
        : translation.twoMean.xAxisTitle2;
        plt.chart.options.scales.yAxes[0].scaleLabel.labelString = translation.twoMean.yAxisTitle;
      }
    );

    this.charts.tailChart.chart.chart.options.scales.xAxes[0].scaleLabel.labelString = translation.twoMean.xAxisTitle3;
    this.charts.tailChart.chart.chart.options.scales.yAxes[0].scaleLabel.labelString = translation.twoMean.yAxisTitle;

    /*this.dom.tailDirectionElement.addEventListener('change', () => {
      this.charts.tailChart.setTailDirection(this.dom.tailDirectionElement.value);
      this.charts.tailChart.updateChart();
    });
    this.dom.tailInputElement.addEventListener('change', () => {
      this.charts.tailChart.setTailInput(this.dom.tailInputElement.value * 1);
      this.charts.tailChart.updateChart();
    });

    this.dom.minIntervalInput.addEventListener('click', e => {
      if (e.target.checked){
        this.dom.minTailValInput.disabled = false;
        this.charts.tailChart.setTailInput(this.dom.minTailValInput.value, this.dom.maxTailValInput.value);
      } else {
        this.dom.minTailValInput.disabled = true;
        this.charts.tailChart.setTailInput(false, this.dom.maxTailValInput.value);
        this.dom.minTailValInput.value = this.charts.tailChart.minTailVal;
      }
    });
    this.dom.maxIntervalInput.addEventListener('click', e => {
      if (e.target.checked){
        this.dom.maxTailValInput.disabled = false;
        this.charts.tailChart.setTailInput(this.dom.minTailValInput.value, this.dom.maxTailValInput.value);
      } else {
        this.dom.maxTailValInput.disabled = true;
        this.charts.tailChart.setTailInput(this.dom.minTailValInput.value, false);
        this.dom.maxTailValInput.value = this.charts.tailChart.maxTailVal;
      }
    });*/
    this.dom.minTailValInput.addEventListener('input', e => {
      this.charts.tailChart.setTailInput(
        Number(this.dom.minTailValInput.value), Number(this.dom.maxTailValInput.value)
      );
      this.intervalLimitsControl();
      this.charts.tailChart.updateChart();  
    });
    this.dom.maxTailValInput.addEventListener('input', e => {
      this.charts.tailChart.setTailInput(
        Number(this.dom.minTailValInput.value), Number(this.dom.maxTailValInput.value)
      );
      this.intervalLimitsControl();
      this.charts.tailChart.updateChart();
    });
    this.dom.includeValMin.addEventListener('click', e => {
      this.charts.tailChart.setTailDirection(e.target.checked, this.dom.includeValMax.checked);
    });
    this.dom.includeValMax.addEventListener('click', e => {
      this.charts.tailChart.setTailDirection(this.dom.includeValMin.checked, e.target.checked);
    });
    
    this.dom.sampleSelect.addEventListener('change', () => {
      let sampleVal = this.dom.sampleSelect.value;
      let sampleFile = null;
      if (sampleVal === 'sample1') {
        sampleFile = '../sampleData/twomean_sample1.csv';
      }
      else if (sampleVal === 'sample2') {
        sampleFile = '../sampleData/twomean_sample2.csv';
      }
      else {
        console.error('unknown sample value', sampleVal);
        return;
      }
      if (sampleFile) {
        fetch(sampleFile)
          .then(res => {
            if (!res.ok) {
              throw new Error(res.status);
            }
            else {
              return res.text();
            }
          })
          .then(txt => {
            this.csvInput.value = txt;
          })
          .catch(err => console.error('Could not fetch', sampleFile, err));
      }
    });
    
    this.updateData([[], []]);
    dropTextFileOnTextArea(this.csvInput);
  }

  reset() {
    this.csvInput.value = '';
    this.dom.sampleSelect.value = null;
    this.dom.sampleSelect.selectedIndex = 0;
    this.loadData(false);
  }

  loadData(alert = true) {
    let rawData = this.parseData(this.csvInput.value.trim());
    if (alert && (!rawData[0] || !rawData[0].length || !rawData[1] || !rawData[1].length)) {
      alert(translation.twoMean.alertAtLeastOne);
    }
    else {
      this.updateData(rawData);
    }
  }

  parseData(dataText) {
    let items = dataText
      .split(/[\r\n]+/)
      .filter(line => line.length)
      .map(line => {
        let [group, value] = line.split(',');
        return [group, value * 1.0]; // coerce value to number type
      });
    let faceted = {};
    for (let [group, value] of items) {
      if (!faceted[group]) {
        faceted[group] = [];
      }
      faceted[group].push(value);
    }
    return Object.values(faceted);
  }

  updateData(data) {
    this.data = data;
    this.data[0] = this.data[0] || [];
    this.data[1] = this.data[1] || [];
    this.sampleDiffs = [];

    let dataValues = data[0].concat(data[1]);
    this.sampleChart1.clear();
    this.sampleChart2.clear();
    if (dataValues.length) {
      let min = Math.min.apply(undefined, dataValues);
      let max = Math.max.apply(undefined, dataValues);
      this.dataChart1.setScale(min, max);
      this.dataChart2.setScale(min, max);
      this.sampleChart1.setScale(min, max);
      this.sampleChart2.setScale(min, max);
      for (let elem of this.dom.needData) {
        elem.removeAttribute('disabled');
      }
      for (let elem of this.dom.needResults) {
        elem.setAttribute('disabled', true);  
      }
    }
    else {
      for (let elem of this.dom.needData) {
        elem.setAttribute('disabled', true);
      }
      for (let elem of this.dom.needResults) {
        elem.setAttribute('disabled', true);  
      }
    }

    this.dataChart1.setDataFromRaw([data[0]]);
    /*this.colorArr1 = colorGen(data[0].length, 'rgba');
    this.dataChart1.chart.data.datasets[0].backgroundColor = this.colorArr1;*/
    this.colorsArray[0] = colorGen(data[0].length, 'rgba');
    this.dataChart1.chart.data.datasets[0].backgroundColor = this.colorsArray[0];
    this.dataChart2.setDataFromRaw([data[1]]);
    this.colorsArray[1] = colorGen(data[1].length, 'rgba');
    this.dataChart2.chart.data.datasets[0].backgroundColor = this.colorsArray[1];
    /*this.colorArr2 = colorGen(data[0].length, 'rgba');
    this.dataChart2.chart.data.datasets[0].backgroundColor = this.colorArr2;*/

    this.dataChart1.scaleToStackDots();
    this.dataChart2.scaleToStackDots();
    this.sampleChart1.scaleToStackDots();
    this.sampleChart2.scaleToStackDots();

    this.dataChart1.chart.update(0);
    this.dataChart2.chart.update(0);
    this.sampleChart1.chart.update(0);
    this.sampleChart2.chart.update(0);

    this.charts.tailChart.reset();
    this.updateSimResults();

    let summary = {
      dataMean1: translation.twoMean.noData,
      dataMean2: translation.twoMean.noData,
      size1: translation.twoMean.noData,
      size2: translation.twoMean.noData,
      dataMeanDiff: translation.twoMean.noData,
    };
    if (data[0].length) {
      summary.dataMean1 = MathUtil.mean(data[0]);
      summary.size1 = data[0].length
    }
    if (data[1].length) {
      summary.dataMean2 = MathUtil.mean(data[1]);
      summary.size2 = data[1].length
    }
    if (data[0].length && data[1].length) {
      summary.dataMeanDiff = summary.dataMean1 - summary.dataMean2;
      /*this.dom.tailInputElement.value = MathUtil.roundToPlaces(summary.dataMeanDiff, 3);
      this.dom.tailInputElement.dispatchEvent(new Event('change'));*/
    }
    Summaries.updateSummaryElements(this.summaryElements, summary);
  }

  count(arr) {
    let counts = {};
    for (let item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
  }

  histPairs(countMap) {
    let pairs = [];
    for (let entry of Object.entries(countMap)) {
      pairs.push({ x: entry[0], y: entry[1] });
    }
    return pairs;
    console.log(countMap, pairs);
  }

  runSim() {
    // Coerce to number
    let numSims = document.getElementById('num-simulations').value * 1;
    let results = [];
    for (let simIdx = 0; simIdx < numSims; simIdx++) {
      let allData = [];
      this.data[0].forEach((val, idx) => 
        allData.push({datasetId: 0, value: val, n: idx})
      );
      this.data[1].forEach( (val, idx) => allData.push({datasetId: 1, value: val, n: idx}));
      /*
      for (let item of this.data[0]) {
        allData.push({ datasetId: 0, value: item });
      }
      for (let item of this.data[1]) {
        allData.push({ datasetId: 1, value: item});
      }*/
      if (allData.length === 0) {
        return;
      }
      let { chosen, unchosen } = randomSubset(allData, this.data[0].length);
      if (simIdx === numSims-1){
        this.addSimulationSample(this.sampleChart1, chosen);
        this.addSimulationSample(this.sampleChart2, unchosen);
        this.sampleChart1.chart.update();
        this.sampleChart2.chart.update();
      }

      // TODO(matthewmerrill): This is very unclear.
      let sampleValues = [ chosen.map(a => a.value), unchosen.map(a => a.value) ];
      let mean0 = MathUtil.mean(sampleValues[0]);
      let mean1 = MathUtil.mean(sampleValues[1]);
      let sampleDiffOfMeans = mean1 - mean0;
      results.push(sampleDiffOfMeans);

      let summary = {
        sampleMean1: mean0,
        sampleMean2: mean1,
        sampleMeanDiff: sampleDiffOfMeans,
      };
      Summaries.updateSummaryElements(this.summaryElements, summary);
    }
    this.charts.tailChart.addAllResults(results);
    this.updateSimResults();
  }

  addSimulationSample(chart, sample) {
    let facetedArrays = [[], []];
    let colorArr = [[], []];
    for (let item of sample) {
      facetedArrays[item.datasetId].push(item.value);
      colorArr[item.datasetId].push(this.colorsArray[item.datasetId][item.n]);
    }
    chart.setDataFromRaw(facetedArrays);
    //chart.chart.data.datasets[0].data.forEach( item => chart.chart.data.datasets[0].backgroundColor.push(this.colorArr1[item.n]));
    chart.chart.data.datasets.forEach( (ds, idx) => ds.backgroundColor = colorArr[idx]);
    chart.scaleToStackDots();
  }

  intervalLimitsControl(){
    const extremes = [
      MathUtil.minInArray(this.charts.tailChart.results),
      MathUtil.maxInArray(this.charts.tailChart.results)
    ];
    this.dom.minTailValInput.min = (extremes[0]%1 === 0)?
    extremes[0] : Math.floor(extremes[0]);
    this.dom.minTailValInput.max = this.dom.maxTailValInput.value;
    this.dom.maxTailValInput.min = this.dom.minTailValInput.value;
    this.dom.maxTailValInput.max = (extremes[1]%1 === 0)?
    extremes[1] : Math.ceil(extremes[1]);
  }

  updateSimResults() {
    let mean0 = MathUtil.mean(this.data[0]);
    let mean1 = MathUtil.mean(this.data[1]);
    //let datasetDiffOfMeans = mean1 - mean0; // TODO(matthewmerrill): cache this! 
    let sampleDiffMean = MathUtil.mean(this.sampleDiffs);
    let sampleDiffStdDev = MathUtil.stddev(this.sampleDiffs);

    let summary = {
      simMean1: mean0,
      simMean2: mean1,
      simMeanDiff: mean1 - mean0,
      sampleDiffMean, sampleDiffStdDev,
    }
    Summaries.updateSummaryElements(this.summaryElements, summary);

    if (this.charts.tailChart.results.length) {
      for (let elem of this.dom.needResults) {
        elem.removeAttribute('disabled');  
      }
    }
    /*
    this.diffChart.updateChart();
    this.diffChart.setDataFromRaw([this.sampleDiffs]);
    this.diffChart.scaleToStackDots();
    this.diffChart.chart.update();
    */

    this.charts.tailChart.setTailDirection(this.dom.includeValMin.checked, this.dom.includeValMax.checked);
    this.charts.tailChart.setTailInput(this.dom.minTailValInput.value, this.dom.maxTailValInput.value);
    this.intervalLimitsControl();
    this.charts.tailChart.updateChart();
  }
}
