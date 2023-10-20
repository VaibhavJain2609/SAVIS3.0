---
---
import {
  dropTextFileOnTextArea,
  parseCSVtoSingleArray,
  readLocalFile,
  enableUploadDataFile
} from "{{base}}../util/csv.js";
import StackedDotChart from "{{base}}../util/stackeddotchart.js";
//import { randomSubset, splitByPredicate } from "{{base}}../util/sampling.js";
import * as MathUtil from "{{base}}../util/math.js";
import { randomSubset, splitByPredicate } from "{{base}}../util/sampling.js";
import translation from "{{base}}../util/translate.js";

export class DotChartTuto {
  constructor(DotChartTutoDiv) {
    this.inputDataArray = [];
    this.sampleDataArray = [];
    this.sampleMeans = [];
    this.translationData = translation.dotChartTuto;
    this.sampleMeansChartLabel = '';
    this.scaleChart = [];
    this.ele = {
      sampleDataDropDown:   DotChartTutoDiv.querySelector("#sample-data-options"),
      csvTextArea:          DotChartTutoDiv.querySelector("#csv-input"),
      loadDataBtn:          DotChartTutoDiv.querySelector("#load-data-btn"),
      resetBtn:             DotChartTutoDiv.querySelector("#reset-btn"),
      uploadbtn:            DotChartTutoDiv.querySelector("#upload-btn"),
      fileInput:            DotChartTutoDiv.querySelector("#fileInput"),
      populationRadio:      DotChartTutoDiv.querySelector("#population-data-radio"),
      sampleRadio:          DotChartTutoDiv.querySelector("#sample-data-radio"),
      inputDataDisplay:     DotChartTutoDiv.querySelector("#input-data-display"),
      meanDescription:      DotChartTutoDiv.querySelector("#input-mean-description"),
      inputDataMean:        DotChartTutoDiv.querySelector("#input-data-mean"),
      stdDescription:       DotChartTutoDiv.querySelector("#input-std-description"),
      inputDataStd:         DotChartTutoDiv.querySelector("#input-data-std"),
      sizeDescription:      DotChartTutoDiv.querySelector("#input-size-description"),
      inputDatasize:        DotChartTutoDiv.querySelector("#input-data-size"),
      sampleSizeInput:      DotChartTutoDiv.querySelector("#sample-data-size"),
      noOfSampleInput:      DotChartTutoDiv.querySelector("#no-of-sample"),
      getSampleBtn:         DotChartTutoDiv.querySelector("#get-sample-btn"),
      sampleDataDisplay:    DotChartTutoDiv.querySelector("#sample-data-display"),
      sampleDataMean:       DotChartTutoDiv.querySelector('#sample-mean'),
      sampleDataStd:        DotChartTutoDiv.querySelector('#drawsample-std'),
      minInterValInput:     DotChartTutoDiv.querySelector("#min-interValue"),
      maxInterValInput:     DotChartTutoDiv.querySelector("#max-interValue"),
      includeValMin:        DotChartTutoDiv.querySelector("#includeMin"),
      includeValMax:        DotChartTutoDiv.querySelector("#includeMax"),
      chosensampleMeans:    DotChartTutoDiv.querySelector("#chosen-sample-means"),
      unchosensampleMeans:  DotChartTutoDiv.querySelector("#unchosen-sample-means"),
      sampleMeansDisplay:   DotChartTutoDiv.querySelector("#sample-means-display"),
      meanOfsampleMeans:    DotChartTutoDiv.querySelector('#sample-means-mean'),
      sampleMeanStd:        DotChartTutoDiv.querySelector("#sample-means-stdError"),
      totalsampleMeans:     DotChartTutoDiv.querySelector("#total-sample-means"),
      needSamples:          DotChartTutoDiv.querySelectorAll("[disabled=need-samples]"),
      DotChartTutoDiv:      DotChartTutoDiv
    };

    // this.readTranlationData();
    enableUploadDataFile(this.ele.uploadbtn, this.ele.fileInput, this.ele.csvTextArea)

    this.datasets = [
      {
        label: this.translationData.inputDataLabel,
        backgroundColor: "orange",
        data: []
      },
      {
        label: this.translationData.sampleDataLabel,
        backgroundColor: "blue",
        data: []
      },
      [
        {
          label: this.translationData.sampleMeansLabel1,
          backgroundColor: "green",
          data: []
        },
        { 
          label: this.translationData.sampleMeansLabel2,
          backgroundColor: "red",
          data: []
        }
      ]
    ];

    this.inputDataChart = new StackedDotChart(
      DotChartTutoDiv.querySelector("#input-data-chart"),
      [this.datasets[0]]
    );
    this.sampleDataChart = new StackedDotChart(
      DotChartTutoDiv.querySelector("#sample-data-chart"),
      [this.datasets[1]]
    );
    this.sampleMeansChart = new StackedDotChart(
      DotChartTutoDiv.querySelector("#sample-means-chart"),
      this.datasets[2]
    );

    [this.inputDataChart, this.sampleDataChart, this.sampleMeansChart].forEach(
      (plt, idx) => {
        plt.chart.options.scales.xAxes[0].scaleLabel.labelString = (idx<2)
        ? this.translationData.xAxisTitle1
        : this.translationData.xAxisTitle2;
        plt.chart.options.scales.yAxes[0].scaleLabel.labelString = this.translationData.yAxisTitle;
      }
    );

    this.loadEventListener = () => {
      this.ele.loadDataBtn.addEventListener("click", e => {
        this.inputDataArray = parseCSVtoSingleArray(this.ele.csvTextArea.value);
        if (this.inputDataArray.length){
          this.updateData(0);
          this.ele.inputDatasize.innerText = this.inputDataArray.length;
          if (!this.ele.sampleRadio.checked) this.enableSampleChart();
        } else this.totalReset();
        e.preventDefault();
      });

      this.ele.resetBtn.addEventListener("click", e => {
        this.totalReset();
      });

      dropTextFileOnTextArea(this.ele.csvTextArea);
      this.sampleListListener();

      this.ele.populationRadio.addEventListener('click', e => {
        this.ele.meanDescription.innerHTML = "&mu;";
        this.ele.stdDescription.innerHTML = "&sigma;";
        this.ele.sizeDescription.innerHTML = "N";
        if (this.inputDataArray.length){
          this.updateData(0);
          this.enableSampleChart();
        }
      });

      this.ele.sampleRadio.addEventListener('click', e => {
        this.ele.meanDescription.innerHTML = "x&#772;";
        this.ele.stdDescription.innerHTML = "s";
        this.ele.sizeDescription.innerHTML = "n";
        this.resetSampleMeansChart();
        this.resetSampleChart();
        if (this.inputDataArray.length) this.updateData(0);
      });

      this.ele.getSampleBtn.addEventListener('click', e => {
        this.disabledControlsSampleMeans(false);
        this.updateSampleData(
          Number(this.ele.sampleSizeInput.value),
          Number(this.ele.noOfSampleInput.value)
        );
        e.preventDefault();
      });

      this.ele.minInterValInput.addEventListener("input", e => {
        if(this.sampleMeans.length) this.updateData(2);
      });

      this.ele.maxInterValInput.addEventListener("input", e=>{
        if(this.sampleMeans.length) this.updateData(2);
      });

      this.ele.DotChartTutoDiv.addEventListener("click", e => {
        if (e.target.className === "toggle-box") {
          const div = e.target.parentElement.nextElementSibling;
          div.style.display = div.style.display === "none" ? "flex" : "none";
        }
        /*if (e.target.id === 'min-MeanTab'){
          this.ele.minInterValInput.value = MathUtil.minInArray(this.sampleMeans);
          if (this.sampleMeans.length) this.updateData(2);
        }
        if (e.target.id === 'max-MeanTab'){
          this.ele.maxInterValInput.value = MathUtil.maxInArray(this.sampleMeans);
          if (this.sampleMeans.length) this.updateData(2);
        }*/
        if (e.target.id === 'includeMin' || e.target.id === 'includeMax'){
          if (this.sampleMeans.length) this.updateData(2);
        }
      });
    };
    this.loadSampleDataList();
    this.loadEventListener();
    this.totalReset();
  }

  loadSampleDataList() {
    const path = [null,  "../sampleData/sample1.csv", "../sampleData/sample2.csv"];
    [this.translationData.selectData, this.translationData.selectOpt1, this.translationData.selectOpt2].forEach(
      (val, idx) => {
        const option = document.createElement("option", {});
        option.setAttribute("value", path[idx]);
        option.innerText = val;
        this.ele.sampleDataDropDown.appendChild(option);
      }
    );
  }

  sampleListListener() {
    this.ele.sampleDataDropDown.addEventListener("change", () => {
      if (this.ele.sampleDataDropDown.value != this.translationData.selectData) {
        readLocalFile(this.ele.sampleDataDropDown.value).then(
          text => (this.ele.csvTextArea.value = text)
        );
      } else this.ele.csvTextArea.value = "";
    });
  }

  enableSampleChart(){
    this.ele.sampleSizeInput.disabled = false;
    this.ele.noOfSampleInput.disabled = false;
    this.ele.getSampleBtn.disabled = false;
    this.ele.sampleSizeInput.value = Math.ceil(this.inputDataArray.length*0.1);
    this.ele.noOfSampleInput.value = 1;
  }

  disabledControlsSampleMeans(flag){
    this.ele.minInterValInput.disabled  = flag;
    this.ele.maxInterValInput.disabled  = flag;
    this.ele.includeValMax.disabled     = flag;
    this.ele.includeValMin.disabled     = flag;
    for (let elem of this.ele.needSamples) {
      elem.disabled = flag;
    }
  }

  resetSampleMeansChart(){
    this.sampleMeans = [];
    this.ele.minInterValInput.value = '';
    this.ele.maxInterValInput.value = '';
    this.ele.includeValMax.checked = false;
    this.ele.includeValMin.checked = false;
    for (let elem of this.ele.needSamples) {
      elem.checked = true;
    }
    this.disabledControlsSampleMeans(true);
    this.ele.chosensampleMeans.innerText = this.translationData.noData;
    this.ele.unchosensampleMeans.innerText = this.translationData.noData;
    this.ele.meanOfsampleMeans.innerText = this.translationData.noData;
    this.ele.totalsampleMeans.innerText = this.translationData.noData;
    this.updateData(2);
    this.ele.sampleMeansDisplay.value = '';
  }
  
  resetSampleChart(){
    this.sampleDataArray = [];
    this.ele.sampleSizeInput.value = "";
    this.ele.noOfSampleInput.value = '';
    this.updateData(1);
    this.ele.sampleDataDisplay.value = '';
    this.ele.sampleSizeInput.disabled = true;
    this.ele.noOfSampleInput.disabled = true;
    this.ele.getSampleBtn.disabled = true;
  }

  totalReset(){
    this.inputDataArray =[];
    this.scaleChart = [];
    this.ele.sampleDataDropDown.selectedIndex = 0;
    this.ele.csvTextArea.value = "";
    this.ele.inputDataDisplay.value = "";
    this.ele.sampleSizeInput.value = "";
    this.ele.inputDatasize.innerText = this.translationData.noData;
    this.sampleSize = undefined;
    this.resetSampleMeansChart();
    this.resetSampleChart();
    this.updateData(0);
  }

  updateInfoSampleMeans(totalChosen, totalUnchosen){
    const proportionChosen = MathUtil.roundToPlaces(totalChosen / this.sampleMeans.length, 4);
    const proportionUnchosen = MathUtil.roundToPlaces(totalUnchosen / this.sampleMeans.length, 4);
    this.ele.totalsampleMeans.innerText = this.sampleMeans.length;
    this.ele.chosensampleMeans.innerText = `${totalChosen} / ${this.sampleMeans.length} = ${proportionChosen}`;
    this.ele.unchosensampleMeans.innerText = `${totalUnchosen} / ${this.sampleMeans.length} = ${proportionUnchosen}`;
  }

  updateSampleData(sz, num){
      try {
        if (!this.ele.sampleSizeInput.value) throw "Ingrese un número";
        let roundedMean;
        let newMeanSamples = [];
        for (let it = 0; it < num; it++) {
          const {chosen, unchosen} = randomSubset(this.inputDataArray, sz);
          roundedMean = MathUtil.roundToPlaces(MathUtil.mean(chosen.map(x => x.value)), 4);
          newMeanSamples.push(roundedMean);
          if (it === num - 1) this.sampleDataArray = chosen;
        }
        if (this.sampleSize !== sz) {
          this.sampleSize = sz;
          this.sampleMeans = newMeanSamples;
        } else  this.sampleMeans = this.sampleMeans.concat(newMeanSamples);
        this.updateData(1);
        const minNumber = MathUtil.minInArray(this.sampleMeans);
        const maxNumber = MathUtil.maxInArray(this.sampleMeans);
        this.ele.minInterValInput.value = (minNumber%1===0)?minNumber-1:Math.floor(minNumber);
        this.ele.maxInterValInput.value = (maxNumber%1===0)?maxNumber+1:Math.ceil(maxNumber);
        this.updateData(2);
    } catch (error) {
        let errMsg ="ERROR\n"
        alert(error);
        //this.ele.getSampleErrorMsg.innerText= errMsg;
    }
  }

  predicateForSets(left, right) {
    if (this.ele.includeValMin.checked && this.ele.includeValMax.checked){
      return function(x) {
        return x >= left && x <= right;
      }
    } else if (this.ele.includeValMin.checked && !this.ele.includeValMax.checked){
      return function(x) {
        return x >= left && x < right;
      }
    } else if (!this.ele.includeValMin.checked && this.ele.includeValMax.checked){
      return function(x) {
        return x > left && x <= right;
      }
    } else if (!this.ele.includeValMin.checked && !this.ele.includeValMax.checked){
      return function(x) {
        return x > left && x < right;
      }
    } else return null;
  }

  updateData(num){
    let dataChart, dataArray, dataDisplay, dataMean, dataStd, valuesArr;
    if (num === 0) {
      dataChart   = this.inputDataChart;
      dataArray   = this.inputDataArray;
      dataDisplay = this.ele.inputDataDisplay;
      dataMean    = this.ele.inputDataMean;
      dataStd     = this.ele.inputDataStd;
    } else if (num === 1){
      dataChart   = this.sampleDataChart;
      dataArray   = this.sampleDataArray;
      dataDisplay = this.ele.sampleDataDisplay;
      dataMean    = this.ele.sampleDataMean;
      dataStd     = this.ele.sampleDataStd;
    } else {
      dataChart   = this.sampleMeansChart;
      dataArray   = this.sampleMeans;
      dataDisplay = this.ele.sampleMeansDisplay;
      dataMean    = this.ele.meanOfsampleMeans;
      dataStd     = this.ele.sampleMeanStd;
    }
    if (dataArray.length){
      if (num !== 2){
        valuesArr = dataArray.map(x => x.value);
        dataChart.setDataFromRaw([valuesArr]);
        dataDisplay.value = dataArray.reduce(
          (acc, x) => acc + `${x.id}`.padEnd(8, ' ' ) + `${x.value}\n`,
          `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.value}\n`
        );
        if (num === 0)
          this.scaleChart = [
            MathUtil.minInArray(valuesArr), MathUtil.maxInArray(valuesArr)
          ];
      } else {
        valuesArr = dataArray;
        const { chosen, unchosen } = splitByPredicate(
          valuesArr,
          this.predicateForSets(
            Number(this.ele.minInterValInput.value),
            Number(this.ele.maxInterValInput.value)
          )
        );
        dataChart.setAnimationDuration(0);
        this.updateInfoSampleMeans(chosen.length, unchosen.length);
        dataChart.setDataFromRaw([chosen, unchosen]);
        dataDisplay.value = dataArray.reduce(
          (acc, x, idx) => acc + `${idx+1}`.padEnd(8, ' ' ) + `${x}\n`,
          `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.mean}\n`
        );
      }
      if (num < 2) dataChart.setScale(this.scaleChart[0], this.scaleChart[1]);
      else dataChart.setScale(
        MathUtil.minInArray(valuesArr), MathUtil.maxInArray(valuesArr)
        );
      if (valuesArr.length < 1000) dataChart.changeDotAppearance(5, undefined);
      else dataChart.changeDotAppearance(3, undefined);
      
      dataChart.scaleToStackDots();;
    } else dataChart.clear();

    dataChart.chart.update();

    dataMean.innerText = dataArray.length
    ? MathUtil.roundToPlaces(MathUtil.mean(valuesArr), 2)
    : this.translationData.noData;
    if (this.ele.populationRadio.checked && num === 0)
      dataStd.innerText = dataArray.length
      ? MathUtil.roundToPlaces(MathUtil.stddev(dataArray.map(x => x.value)), 2)
      : this.translationData.noData;
    else if (num === 2)
      dataStd.innerText = dataArray.length
      ? MathUtil.roundToPlaces(MathUtil.sampleStddev(dataArray), 2)
      : this.translationData.noData;
    else
      dataStd.innerText = dataArray.length
      ? MathUtil.roundToPlaces(MathUtil.sampleStddev(dataArray.map(x => x.value)), 2)
      : this.translationData.noData;
  }
}