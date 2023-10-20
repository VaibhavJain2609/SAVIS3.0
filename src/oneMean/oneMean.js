---
---
import {
  dropTextFileOnTextArea,
  parseCSVtoSingleArray,
  readLocalFile,
  enableUploadDataFile
} from "{{base}}../util/csv.js";
import StackedDotChart from "{{base}}../util/stackeddotchart.js";
import { randomSubset, splitByPredicate } from "{{base}}../util/sampling.js";
import * as MathUtil from "{{base}}../util/math.js";
import translation from "{{base}}../util/translate.js";

export class OneMean {
  constructor(OneMeanDiv) {
    this.shiftMean = 0;
    this.mulFactor = 0;
    //this.populationData = [];
    this.populationMean = undefined;
    this.originalData = [];
    this.mostRecentDraw = [];
    this.sampleMeans = [];
    this.sampleSize = undefined;
    this.translationData = undefined;
    this.tailDirection = null;
    this.scaleValues = [];
    this.dataReserv = [];
    this.translationData = translation.oneMean;
    this.sampleMeansChartLabel = null;
    this.ele = {
      csvTextArea: OneMeanDiv.querySelector("#csv-input"),
      loadDataBtn: OneMeanDiv.querySelector("#load-data-btn"),
      //shiftMeanInput: OneMeanDiv.querySelector("#shiftMeanInput"),
      originalDataDisplay: OneMeanDiv.querySelector("#original-data-display"),
      /*populationDataDisplay: OneMeanDiv.querySelector(
        "#population-data-display"
      ),*/
      recentSampleDisplay: OneMeanDiv.querySelector(
        "#most-recent-sample-display"
      ),
      sampleMeansDisplay: OneMeanDiv.querySelector("#samples-mean-display"),
      sampleMean: OneMeanDiv.querySelector("#sample-mean"),
      samplesMean: OneMeanDiv.querySelector("#samples-mean"),
      originalMean: OneMeanDiv.querySelector("#original-mean"),
      /*polulationMean: OneMeanDiv.querySelector("#population-mean"),
      mulFactorDisplay: OneMeanDiv.querySelector("#mul-factor-display"),
      mulFactorSlider: OneMeanDiv.querySelector("#mul-factor"),*/
      runSimBtn: OneMeanDiv.querySelector("#run-sim-btn"),
      drawSampleStd: OneMeanDiv.querySelector("#drawsample-std"),
      sampleSizeInput: OneMeanDiv.querySelector("#sample-size"),
      noOfSampleInput: OneMeanDiv.querySelector("#no-of-sample"),
      //Eliminar los dos siguientes
      /*tailValueInput: OneMeanDiv.querySelector("#tailValue"),
      tailDirectionInput: OneMeanDiv.querySelector("#tailDirection"),*/

      // Se agregan estos cinco
      minTailValInput: OneMeanDiv.querySelector("#min-tailValue"),
      maxTailValInput: OneMeanDiv.querySelector("#max-tailValue"),
      includeValMin: OneMeanDiv.querySelector("#includeMin"),
      includeValMax: OneMeanDiv.querySelector("#includeMax"),
      chosensampleMeans: OneMeanDiv.querySelector("#chosen-sample-means"),
      unchosensampleMeans: OneMeanDiv.querySelector("#unchosen-sample-means"),

      /*totalSelectedSamplesDisplay: OneMeanDiv.querySelector(
        "#total-selected-samples"
      ),*/
      totalSamplesDisplay: OneMeanDiv.querySelector("#total-samples"),
      //proportionDisplay: OneMeanDiv.querySelector("#proportion"),
      oneMeanDiv: OneMeanDiv,
      runSimErrorMsg: OneMeanDiv.querySelector("#run-sim-error-msg"),
      sampleDataDropDown: OneMeanDiv.querySelector("#sample-data"),
      resetBtn: OneMeanDiv.querySelector("#reset-btn"),
      translationData: OneMeanDiv.querySelector("#translation-data"),
      originalStd: OneMeanDiv.querySelector("#original-std"),
      sampleMeansStd: OneMeanDiv.querySelector("#samplemeans-std"),
      //populationStd: OneMeanDiv.querySelector("#population-std"),
      uploadbtn: OneMeanDiv.querySelector("#upload-btn"),
      fileInput: OneMeanDiv.querySelector("#fileInput"),
      size: OneMeanDiv.querySelector("#originalsize")

    };

    // this.readTranlationData();
    enableUploadDataFile(this.ele.uploadbtn, this.ele.fileInput, this.ele.csvTextArea)

    this.datasets = [
      {
        label: this.translationData.original,
        backgroundColor: "orange",
        data: []
      },
      {
        label: this.translationData.hypotheticalPopulation,
        backgroundColor: "orange",
        data: []
      },
      {
        label: this.translationData.mostRecentDraw,
        backgroundColor: "blue",
        data: []
      },
      [
        {
          label: this.translationData.sampleMeans,
          backgroundColor: "green",
          data: []
        },
        { label: "N/A", backgroundColor: "red", data: [] }
      ]
    ];

    this.dataChart1 = new StackedDotChart(
      OneMeanDiv.querySelector("#original-data-chart"),
      [this.datasets[0]]
    );
    /*this.dataChart2 = new StackedDotChart(
      OneMeanDiv.querySelector("#population-data-chart"),
      [this.datasets[1]]
    );*/
    //this.dataChart2.setAnimationDuration(0);
    this.dataChart3 = new StackedDotChart(
      OneMeanDiv.querySelector("#sample-data-chart"),
      [this.datasets[2]]
    );
    this.dataChart3.setAnimationDuration(0);
    this.dataChart4 = new StackedDotChart(
      OneMeanDiv.querySelector("#statistic-data-chart"),
      this.datasets[3]
    );
    this.dataChart4.setAnimationDuration(0);
    this.dataName = {
      orginalData: "orginalData",
      populationData: "populationData",
      mostRecentDraw: "mostRecentDraw",
      sampleMeans: "sampleMeans"
    };
    [this.dataChart1, /*this.dataChart2,*/ this.dataChart3, this.dataChart4].forEach(
      (plt, idx) => {
        plt.chart.options.scales.xAxes[0].scaleLabel.labelString = (idx < 3)
          ? this.translationData.xAxisTitle1
          : this.translationData.xAxisTitle2;
        plt.chart.options.scales.yAxes[0].scaleLabel.labelString = this.translationData.yAxisTitle;
      }
    );
    this.loadEventListener = () => {
      this.ele.loadDataBtn.addEventListener("click", e => {
        this.originalData = parseCSVtoSingleArray(this.ele.csvTextArea.value);
        this.updateData(this.dataName.orginalData);
        this.shiftMean = 0;
        this.mulFactor = 0;
        this.ele.size.innerText = this.originalData.length
        this.clearResult();
        /*this.updatedPopulationData(
          this.originalData,
          this.shiftMean,
          this.mulFactor
        );*/
        e.preventDefault();
      });

      dropTextFileOnTextArea(this.ele.csvTextArea);
      this.sampleListListener();
      /*this.shiftMeanListener();
      this.mulFactorListener();*/
      this.resetBtnListener();

      this.ele.runSimBtn.addEventListener("click", e => {
        const newSampleSize = Number(this.ele.sampleSizeInput.value);
        const noOfSamples = Number(this.ele.noOfSampleInput.value);
        this.runSim(newSampleSize, noOfSamples);
        e.preventDefault();
      });
      /* Eliminar esta función
      this.ele.tailDirectionInput.addEventListener("change", e => {
        if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
      });*/

      // Agregar estas tres
      this.ele.minTailValInput.addEventListener("input", e => {
        if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
      });

      this.ele.maxTailValInput.addEventListener("input", e => {
        if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
      });

      /*this.ele.createIntervBtn.addEventListener("click", e => {
        e.preventDefault();
      });*/

      /* Eliminar esta función
      this.ele.tailValueInput.addEventListener("input", e => {
      });

      this.ele.shiftMeanInput.addEventListener("click", e =>{
        console.log(e.target.checked);
      });

      this.ele.shiftMeanInput.addEventListener("input", e => {
        this.updatedPopulationData(
          this.originalData,
          Number(e.target.value) || 0,
          this.mulFactor
        );
        //this.clearResult();
      });*/

      this.ele.oneMeanDiv.addEventListener("click", e => {
        if (e.target.className === "toggle-box") {
          const div = e.target.parentElement.nextElementSibling;
          div.style.display = div.style.display === "none" ? "flex" : "none";
        }
        /*if (e.target.id == 'min-MeanTab'){
          this.ele.minTailValInput.value = MathUtil.minInArray(this.sampleMeans);
          if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
        }
        if (e.target.id == 'max-MeanTab'){
          this.ele.maxTailValInput.value = MathUtil.maxInArray(this.sampleMeans);
          if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
        }*/
        if (e.target.id == 'includeMin' || e.target.id == 'includeMax') {
          if (this.sampleMeans.length) this.updateData(this.dataName.sampleMeans);
        }
      });
    };
    this.loadSampleDataList();
    this.loadEventListener();
  }

  loadSampleDataList() {
    const path = [null, "../sampleData/sample1.csv", "../sampleData/sample2.csv"];
    [this.translationData.selectData, this.translationData.selectOpt1, this.translationData.selectOpt2].forEach(
      (val, idx) => {
        const option = document.createElement("option", {});
        option.setAttribute("value", path[idx]);
        option.innerText = val;
        this.ele.sampleDataDropDown.appendChild(option);
      }
    );
  }

  runSim(sampleSize, noOfSample) {
    // if (this.populationData.length === 0) return;
    const newMeanSamples = [];
    try {
      //if (!this.populationData.length) throw this.translationData.errorNoPopulation;
      if (!this.originalData.length) throw this.translationData.errorNoPopulation;
      for (let i = 0; i < noOfSample; i++) {
        const { chosen, unchoosen } = randomSubset(
          //this.populationData,
          this.originalData,
          sampleSize
        );
        const roundedMean = MathUtil.roundToPlaces(
          MathUtil.mean(chosen.map(x => x.value)),
          3
        );
        newMeanSamples.push(roundedMean);
        if (i === noOfSample - 1) this.mostRecentDraw = chosen;
      }
      if (this.sampleSize !== sampleSize) {
        this.sampleSize = sampleSize;
        this.sampleMeans = newMeanSamples;
      } else {
        this.sampleMeans = this.sampleMeans.concat(newMeanSamples);
      }
      const minNumber = MathUtil.minInArray(this.sampleMeans);
      const maxNumber = MathUtil.maxInArray(this.sampleMeans);
      this.ele.minTailValInput.value = (minNumber % 1 == 0) ? minNumber - 1 : Math.floor(minNumber);
      this.ele.maxTailValInput.value = (maxNumber % 1 == 0) ? maxNumber + 1 : Math.ceil(maxNumber);
    } catch (err) {
      let errMsg = "ERROR\n"
      //if (this.populationData.length)
      if (this.originalData.length)
        errMsg += this.translationData.errorNotEnoughElements;
      else
        errMsg += this.translationData.errorNoPopulation;
      this.ele.runSimErrorMsg.innerText = errMsg;
      setTimeout(() => {
        this.ele.runSimErrorMsg.innerText = "";
      }, 2000);
    }
    this.updateData(this.dataName.mostRecentDraw);
    this.updateData(this.dataName.sampleMeans);
  }

  resetBtnListener() {
    this.ele.resetBtn.addEventListener("click", e => {
      this.clearResult();
      this.ele.csvTextArea.value = "";
      this.originalData = [];
      this.updateData(this.dataName.orginalData);
      this.shiftMean = 0;
      this.mulFactor = 0;
      this.ele.size.innerText = 0
      this.clearResult();
      this.ele.sampleDataDropDown.selectedIndex = 0;
      /*this.updatedPopulationData(
        this.originalData,
        this.shiftMean,
        this.mulFactor
      );*/
      e.preventDefault();
    });
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

  /*shiftMeanListener() {
    alert(this.ele.shiftMeanInput.value);
    this.updatedPopulationData(
      this.originalData,
      //Number(e.target.value) || 0,
      Number(this.ele.shiftMeanInput.value) || 0,
      this.mulFactor
    );
    this.clearResult();
    //this.ele.shiftMeanInput.addEventListener("input", e => {});
  }

  mulFactorListener() {
    this.ele.mulFactorSlider.addEventListener("change", e => {
      const mulFactor = Number(e.target.value);
      //this.ele.mulFactorDisplay.innerText = mulFactor;
    });
    this.ele.mulFactorSlider.addEventListener("input", e => {
      const mulFactor = Number(e.target.value);
      this.updatedPopulationData(this.originalData, this.shiftMean, mulFactor);
      //this.ele.mulFactorDisplay.innerText = mulFactor;
      this.clearResult();
    });
  }*/

  /*updatedPopulationData(originalData, shift, mulFactor) {
    this.shiftMean = shift;
    //this.ele.shiftMeanInput.value = shift;
    this.mulFactor = mulFactor;
    this.populationData = [];
    originalData.forEach(x => {
      for (let i = 0; i <= mulFactor; i++){
        this.populationData.push({
          id: (x.id-1)*(mulFactor+1)+i+1,
          value: MathUtil.roundToPlaces(x.value + shift, 4)
        })
      }
    })
    this.populationMean = MathUtil.roundToPlaces(MathUtil.mean(this.populationData.map(x => x.value)), 2);
    //this.ele.populationStd.innerText = MathUtil.roundToPlaces(MathUtil.stddev(this.populationData.map(x => x.value)), 2);
    this.updateData(this.dataName.populationData);
  }*/

  clearResult() {
    /*this.ele.shiftMeanInput.value = this.shiftMean;
    this.ele.mulFactorSlider.value = this.mulFactor;
    /this.ele.mulFactorDisplay.innerText = this.mulFactor;*/
    this.mostRecentDraw = [];
    this.sampleMeans = [];
    this.tailDirection = null;
    //this.ele.tailDirectionInput.value = this.tailDirection;
    this.updateData(this.dataName.mostRecentDraw);
    this.updateData(this.dataName.sampleMeans);
  }

  //update chart, mean and textarea based on the dataName
  updateData(dataName) {
    let chart, data, meanEle, /*key,*/ textAreaEle;
    if (dataName === this.dataName.orginalData) {
      chart = this.dataChart1;
      data = this.originalData;
      meanEle = this.ele.originalMean;
      textAreaEle = this.ele.originalDataDisplay;
      //this.ele.originalStd.innerText = MathUtil.roundToPlaces(MathUtil.sampleStddev(data.map(x => x.value)), 2);
      this.ele.originalStd.innerText = MathUtil.roundToPlaces(MathUtil.stddev(data.map(x => x.value)), 2);
      this.scaleValues = [MathUtil.minInArray(data.map(x => x.value)), MathUtil.maxInArray(data.map(x => x.value))];
    } /*else if (dataName === this.dataName.populationData) {
      chart = this.dataChart2;
      data = this.populationData;
      meanEle = this.ele.polulationMean;
      textAreaEle = this.ele.populationDataDisplay;
    }*/ else if (dataName === this.dataName.mostRecentDraw) {
      chart = this.dataChart3;
      data = this.mostRecentDraw;
      meanEle = this.ele.sampleMean;
      textAreaEle = this.ele.recentSampleDisplay;
      this.ele.drawSampleStd.innerText = MathUtil.roundToPlaces(MathUtil.sampleStddev(data.map(x => x.value)), 2);
    } else {
      chart = this.dataChart4;
      data = this.sampleMeans;
      meanEle = this.ele.samplesMean;
      textAreaEle = this.ele.sampleMeansDisplay;
      this.ele.sampleMeansStd.innerText = MathUtil.roundToPlaces(MathUtil.stddev(data), 2);
    }
    // update chart
    let valuesArr = null;
    if (data.length) {
      if (dataName !== this.dataName.sampleMeans) {
        valuesArr = data.map(x => x.value);
        chart.setDataFromRaw([valuesArr]);
      } else {
        valuesArr = data;
        //const mean = this.populationMean;*/
        const { chosen, unchosen } = splitByPredicate(
          valuesArr,
          this.predicateForTail(Number(this.ele.minTailValInput.value), Number(this.ele.maxTailValInput.value))
        );
        //update statistic output
        this.updateStatistic(chosen.length, unchosen.length);
        this.updateSampleMeansChartLabels(this.sampleMeansChartLabel);
        chart.setDataFromRaw([chosen, unchosen]);
      }
      // if (data.length > 500) chart.setAnimationDuration(0);
      // else chart.setAnimationDuration(1000);
      if (valuesArr.length < 1000) chart.changeDotAppearance(5, undefined);
      else chart.changeDotAppearance(3, undefined);
      //if (dataName===this.dataName.mostRecentDraw)  this.ele.drawSampleStd.innerText = MathUtil.roundToPlaces(MathUtil.sampleStddev(valuesArr), 2);
      if (dataName === this.dataName.orginalData || dataName === this.dataName.sampleMeans) chart.setScale(MathUtil.minInArray(valuesArr), MathUtil.maxInArray(valuesArr));
      else chart.setScale(this.scaleValues[0], this.scaleValues[1]);
    } else chart.clear();

    chart.scaleToStackDots();
    chart.chart.update();

    //update mean output
    const mean = data.length
      ? MathUtil.roundToPlaces(MathUtil.mean(valuesArr), 2)
      : this.translationData.noData;
    meanEle.innerText = mean;
    /*if (dataName === this.dataName.orginalData && !isNaN(mean)) {
      this.ele.tailValueInput.value = mean;
    }*/
    // update text area output
    if (dataName !== this.dataName.sampleMeans) {
      textAreaEle.value = data.reduce(
        (acc, x) => acc + `${x.id}`.padEnd(8, ' ') + `${x.value}\n`,
        `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.value}\n`
      );
    } else {
      textAreaEle.value = data.reduce(
        (acc, x, index) => acc + `${index + 1}`.padEnd(8, ' ') + `${x}\n`,
        `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.mean}\n`
      );
    }
  }

  updateStatistic(totalChosen, totalUnchosen) {
    const totalSamples = totalChosen + totalUnchosen;
    const proportionChosen = MathUtil.roundToPlaces(totalChosen / totalSamples, 4);
    const proportionUnchosen = MathUtil.roundToPlaces(totalUnchosen / totalSamples, 4);
    //this.ele.totalSelectedSamplesDisplay.innerText = totalChosen;
    this.ele.totalSamplesDisplay.innerText = totalSamples;
    this.ele.chosensampleMeans.innerText = `${totalChosen} / ${totalSamples} = ${proportionChosen}`;
    this.ele.unchosensampleMeans.innerText = `${totalUnchosen} / ${totalSamples} = ${proportionUnchosen}`;
  }

  predicateForTail(left, right) {
    if (this.ele.includeValMin.checked && this.ele.includeValMax.checked) {
      this.sampleMeansChartLabel = 'closed';
      return function (x) {
        return x >= left && x <= right;
      }
    } else if (this.ele.includeValMin.checked && !this.ele.includeValMax.checked) {
      this.sampleMeansChartLabel = 'left';
      return function (x) {
        return x >= left && x < right;
      }
    } else if (!this.ele.includeValMin.checked && this.ele.includeValMax.checked) {
      this.sampleMeansChartLabel = 'right';
      return function (x) {
        return x > left && x <= right;
      }
    } else if (!this.ele.includeValMin.checked && !this.ele.includeValMax.checked) {
      this.sampleMeansChartLabel = 'open';
      return function (x) {
        return x > left && x < right;
      }
    } else return null;
  }

  updateSampleMeansChartLabels(intervalType) {
    const sampleName = this.translationData.sampleMeans;
    if (intervalType === "closed") {
      this.dataChart4.updateLabelName(0,
        Number(this.ele.minTailValInput.value) + ' ≤ ' + sampleName + ' ≤ ' + Number(this.ele.maxTailValInput.value));
      this.dataChart4.updateLabelName(1,
        sampleName + ' < ' + Number(this.ele.minTailValInput.value) + '  ⋃  ' + Number(this.ele.maxTailValInput.value) + ' < ' + sampleName);
    } else if (intervalType === "left") {
      this.dataChart4.updateLabelName(0,
        Number(this.ele.minTailValInput.value) + ' ≤ ' + sampleName + ' < ' + Number(this.ele.maxTailValInput.value));
      this.dataChart4.updateLabelName(1,
        sampleName + ' < ' + Number(this.ele.minTailValInput.value) + '  ⋃  ' + Number(this.ele.maxTailValInput.value) + ' ≤ ' + sampleName);
    } else if (intervalType === "right") {
      this.dataChart4.updateLabelName(0,
        Number(this.ele.minTailValInput.value) + ' < ' + sampleName + ' ≤ ' + Number(this.ele.maxTailValInput.value));
      this.dataChart4.updateLabelName(1,
        sampleName + ' ≤ ' + Number(this.ele.minTailValInput.value) + '  ⋃  ' + Number(this.ele.maxTailValInput.value) + ' < ' + sampleName);
    } else if (intervalType === "open") {
      this.dataChart4.updateLabelName(0,
        Number(this.ele.minTailValInput.value) + ' < ' + sampleName + ' < ' + Number(this.ele.maxTailValInput.value));
      this.dataChart4.updateLabelName(1,
        sampleName + ' ≤ ' + Number(this.ele.minTailValInput.value) + '  ⋃  ' + Number(this.ele.maxTailValInput.value) + ' ≤ ' + sampleName);
    } else {
      this.dataChart4.updateLabelName(0, sampleName);
      this.dataChart4.updateLabelName(1, "N/A");
    }

  }
}
