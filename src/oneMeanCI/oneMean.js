---
---
import {
  dropTextFileOnTextArea,
  parseCSVtoSingleArray,
  readLocalFile,
  enableUploadDataFile
} from "{{base}}../util/csv.js";
import { getSampleDataDirectory, getDefaultValues, extractDataByColumn, computeFrequencies, computeDataSimilarity } from "{{base}}../util/utilities.js"
import StackedDotChart from "{{base}}../util/stackeddotchart.js";
import { randomSubset, splitByPredicate, splitUsing } from "{{base}}../util/sampling.js";
import * as MathUtil from "{{base}}../util/math.js";
import translation from "{{base}}../util/translate.js";
import coverageChart from "{{base}}../util/coveragechart.js";

export class OneMean {
  constructor(OneMeanDiv) {
    this.oneMeanDiv = OneMeanDiv
    this.translationData = translation.oneMean
    this.shiftMean = 0
    this.multiplyFactor = 0
    this.originalDataFreqs = {}
    this.originalData = []
    this.populationData = []
    this.sampleSize = 10
    this.numOfSamples = 1
    this.latestSampleDraw = []
    this.sampleMeans = []
    this.sampleStd = []
    this.tenthSampleMeans = 0
    this.intervalType = {left: false, right: false}
    this.confidenceLevel = 95
    this.charMu = "µ"
    this.elements = {
      sampleDataSelectionDropdown: this.oneMeanDiv.querySelector("#sample-data"),
      csvDataTextArea: this.oneMeanDiv.querySelector("#csv-input"),
      loadDataButton: this.oneMeanDiv.querySelector('#load-data-btn'),
      meanDescription: this.oneMeanDiv.querySelector("#input-mean-description"),
      stdDescription: this.oneMeanDiv.querySelector("#input-std-description"),
      sizeDescription: this.oneMeanDiv.querySelector("#input-size-description"),
      originalDataTextArea: this.oneMeanDiv.querySelector("#original-data-display"),
      originalDataMeanDisplay: this.oneMeanDiv.querySelector("#original-mean"),
      originalDataStandardDeviationDisplay: this.oneMeanDiv.querySelector("#original-std"),
      resetDataButton: OneMeanDiv.querySelector("#reset-btn"),
      toggleCheckBoxes: this.oneMeanDiv.querySelectorAll("input[type='checkbox']"),
      dataSections: this.oneMeanDiv.querySelectorAll(".chart-input-form"),
      originialDataChart: this.oneMeanDiv.querySelector("#original-data-chart"),
      /*shiftMeanInput: this.oneMeanDiv.querySelector("#shiftMeanInput"),
      populationDataTextArea: this.oneMeanDiv.querySelector("#population-data-display"),
      populationDataMean: this.oneMeanDiv.querySelector("#population-mean"),
      populationDataSTD: this.oneMeanDiv.querySelector("#population-std"),
      multiplyPopulationDataSlider: this.oneMeanDiv.querySelector("#mul-factor"),
      multiplyPopulationDataDisplay: this.oneMeanDiv.querySelector("#mul-factor-display"),
      populationDataChart: this.oneMeanDiv.querySelector("#population-data-chart"),*/
      sampleSizeInput: this.oneMeanDiv.querySelector("#sample-size"),
      numberOfSamplesInput: this.oneMeanDiv.querySelector("#no-of-sample"),
      runSimBtn: this.oneMeanDiv.querySelector("#run-sim-btn"),
      sampleDrawTextArea: this.oneMeanDiv.querySelector("#most-recent-sample-display"),
      sampleDrawMean: this.oneMeanDiv.querySelector("#sample-mean"),
      sampleDrawSTD: this.oneMeanDiv.querySelector("#sample-sd"),
      sampleDrawSimError: this.oneMeanDiv.querySelector("#run-sim-error-msg"),
      sampleDrawChart: this.oneMeanDiv.querySelector("#sample-data-chart"),
      samplesMeanTextArea: this.oneMeanDiv.querySelector("#samples-mean-display"),
      sampleMeansMean: this.oneMeanDiv.querySelector("#samples-mean"),
      sampleMeansSTD: this.oneMeanDiv.querySelector("#samplemeans-std"),
      /*confidenceLevelSlider: this.oneMeanDiv.querySelector("#confidence-level"),
      confidenceLevelDisplay: this.oneMeanDiv.querySelector("#confidence-level-display"),*/
      totalSampleMeans: this.oneMeanDiv.querySelector("#total-samples"),
      confidenceIntervalChart: this.oneMeanDiv.querySelector("#statistic-data-chart"),
      minInterValInput: this.oneMeanDiv.querySelector("#min-interValue"),
      maxInterValInput: this.oneMeanDiv.querySelector("#max-interValue"),
      includeValMin: this.oneMeanDiv.querySelector("#includeMin"),
      includeValMax: this.oneMeanDiv.querySelector("#includeMax"),
      chosenSampleMeans: this.oneMeanDiv.querySelector("#chosen-sample-means"),
      unchosenSampleMeans: this.oneMeanDiv.querySelector("#unchosen-sample-means"),
      /*lower: this.oneMeanDiv.querySelector("#lower"),
      upper: this.oneMeanDiv.querySelector("#upper"),
      buildCI: this.oneMeanDiv.querySelector("#buildci"),*/
      uploadbtn: this.oneMeanDiv.querySelector("#upload-btn"),
      fileInput: this.oneMeanDiv.querySelector("#fileInput"),
      size: this.oneMeanDiv.querySelector("#originalsize"),
      noOfCoveragesInput: this.oneMeanDiv.querySelector("#no-of-coverages"),
      coverageChart: this.oneMeanDiv.querySelector("#coverage-chart"),
      buildCovBtn: this.oneMeanDiv.querySelector("#build-coverages"),
      coverageWithMean: this.oneMeanDiv.querySelector("#with-mean"),
      coverageWithoutMean: this.oneMeanDiv.querySelector("#without-mean"),
      coveragesMsg: this.oneMeanDiv.querySelector("#warning-coverage-msg"),
      samplesMeanCoverageTable: this.oneMeanDiv.querySelector("#sample-mean-coverages-table"),
      samplesMeanCoverageDisplay: this.oneMeanDiv.querySelector("#sample-mean-coverages-display")
    }
    this.dataSections = {
      originalData: 'originalData',
      hypotheticalPopulationData: 'hypotheticalPopulationData',
      sampleDrawSection: 'sampleDrawSection',
      confidenceIntervalSection: 'confidenceIntervalSection',
      coverageCISection: 'coverageCISection'
    }

    /*this.sampleDataOptions = {

      "Select Sample Data": null,
      Sample1: `${getSampleDataDirectory()}/sample1.csv`,
      Sample2: `${getSampleDataDirectory()}/sample2.csv`
    }*/

    this.datasets = [{
      label: this.translationData.original,
      backgroundColor: 'orange',
      data: []
    }, {
      //label: this.translationData.hypotheticalPopulation,
      label: 'undefined',
      //backgroundColor: 'orange',
      data: []
    }, {
      label: this.translationData.mostRecentDraw,
      backgroundColor: 'purple',
      data: []
    }, [
      {
        label: this.translationData.InInterval,
        backgroundColor: 'green',
        data: []
      },
      {
        label: this.translationData.NotInInterval,
        backgroundColor: 'red',
        data: []
      }
    ], [
      {
        label: this.translationData.samplesWithMean,
        backgroundColor: 'rgba(31,255,31,1)',
        borderColor: 'rgba(31,255,31,1)',
        data: []
      }, {
        label: this.translationData.samplesWithoutMean,
        backgroundColor: 'red',
        borderColor: 'red',
        data: []
      }, {
        label: this.charMu,
        backgroundColor: 'black',
        borderColor: 'black',
        data: []
      }
    ]]
    this.charts = {
      originalDataChart: new StackedDotChart(
        this.elements.originialDataChart,
        [this.datasets[0]]
      ),
      /*hypotheticalPopulationChart: new StackedDotChart(
        this.elements.populationDataChart,
        [this.datasets[1]]
      ),*/
      sampleDrawChart: new StackedDotChart(
        this.elements.sampleDrawChart,
        [this.datasets[2]]

      ),
      confidenceIntervalChart: new StackedDotChart(
        this.elements.confidenceIntervalChart,
        this.datasets[3]
      ),
      coverageCI: new coverageChart(
        this.elements.coverageChart,
        this.datasets[4]
      )
    }
    //this.charts.hypotheticalPopulationChart.setAnimationDuration(0)
    this.charts.sampleDrawChart.setAnimationDuration(0)
    this.charts.confidenceIntervalChart.setAnimationDuration(0)
    this.intialize()

    //this.elements.dataSections[1].classList.add('hideDataSection')

  }

  intialize() {
    this.loadSampleDataOptions()
    this.loadChartLabels();
    this.addSelectDataDropDownListener()
    this.addLoadButtonListener()
    this.addToggleCheckBoxesListerners()
    /*this.addShiftMeanInputListener()
    this.addMultiplyFactorSliderListener()*/
    this.addResetButtonListener()
    this.addRunSimulationClickListener()
    /*this.addConfidenceLevelSliderListener()
    this.addBuildCIListener()*/
    this.addIntervalControl()
    this.addBuildCoveragesListener()
    //this.addIncludeCheckBoxListener()
    enableUploadDataFile(this.elements.uploadbtn, this.elements.fileInput, this.elements.csvDataTextArea)
    dropTextFileOnTextArea(this.elements.csvDataTextArea)

  }
  /* Start of  Add Event Listeners*/
  addSelectDataDropDownListener() {
    this.elements.sampleDataSelectionDropdown.addEventListener(
      'change',
      this.renderSampleDataSelectionCallBackFunc()
    )
  }
  addLoadButtonListener() {
    this.elements.loadDataButton.addEventListener('click', this.loadDataButtonCallBackFunc())
  }

  addResetButtonListener() {
    this.elements.resetDataButton.addEventListener('click', this.resetButtonCallBackFunc())
  }
  addToggleCheckBoxesListerners() {
    this.elements.toggleCheckBoxes.forEach((checkbox, index) => {
      if (checkbox.className === 'toggle-box')
        checkbox.addEventListener('change', (event) => {
          if (!checkbox.checked && index != 1) {
            this.elements.dataSections[index].classList.add('hideDataSection')

          } else if (index != 1) {
            this.elements.dataSections[index].classList.remove('hideDataSection')
          }
          event.preventDefault()
        })
      if (checkbox.id === 'includeMin' || checkbox.id === 'includeMax')
        checkbox.addEventListener('change', (event) => {
          if (this.sampleMeans.length) this.updateData(this.dataSections.confidenceIntervalSection)
          event.preventDefault()
        })
    })
  }
  /*addShiftMeanInputListener() {
    this.elements.shiftMeanInput.addEventListener('input', (event) => {
      this.shiftMean = Number(this.elements.shiftMeanInput.value) || 0
      this.updatePopulationData()
      this.clearResult()
      event.preventDefault()

    })
  }
  addMultiplyFactorSliderListener() {
    this.elements.multiplyPopulationDataSlider.addEventListener('input', (event) => {
      this.multiplyFactor = Number(this.elements.multiplyPopulationDataSlider.value) || 0
      this.elements.multiplyPopulationDataDisplay.innerText = this.multiplyFactor
      this.updatePopulationData()
      this.clearResult()
      event.preventDefault()
    })
  }*/
  /*addConfidenceLevelSliderListener() {
    this.elements.confidenceLevelSlider.addEventListener('input', (event) => {
      this.confidenceLevel = Number(this.elements.confidenceLevelSlider.value) || 95
      this.elements.confidenceLevelDisplay.innerText = this.confidenceLevel


      event.preventDefault()
    })
  }
  addBuildCIListener() {
    this.elements.buildCI.addEventListener('click', (event) => {
      this.updateData(this.dataSections.confidenceIntervalSection)

      event.preventDefault()
    })
  }*/
  addIntervalControl(){
    this.elements.minInterValInput.addEventListener("input", e => {
      if (this.sampleMeans.length) {
        this.updateData(this.dataSections.confidenceIntervalSection)
        this.intervalLimitsControl()
      }
    });

    this.elements.maxInterValInput.addEventListener("input", e=>{
      if(this.sampleMeans.length) {
        this.updateData(this.dataSections.confidenceIntervalSection)
        this.intervalLimitsControl()
      }
    });
  }
  addRunSimulationClickListener() {
    this.elements.runSimBtn.addEventListener('click', this.runSimulationCallBackFunc())
  }

  addBuildCoveragesListener() {
    this.elements.buildCovBtn.addEventListener('click', this.addBuildCoveragesCallBackFunc())
  }
  /*addIncludeCheckBoxListener(){
    this.elements.includeValMin.addEventListener("click", this.includeValueIntervalCallBackFunc())
    this.elements.includeValMax.addEventListener("click", this.includeValueIntervalCallBackFunc())
  }
  /* End of Add Event Listeners */

  loadSampleDataOptions() {
    /*Object.keys(this.sampleDataOptions).forEach(sampleDataOption => {
      const option = document.createElement("option")
      option.value = sampleDataOption
      option.innerText = sampleDataOption
      this.elements.sampleDataSelectionDropdown.appendChild(option)
    });*/
      
    const paths = [null, `${getSampleDataDirectory()}/sample1.csv`, `${getSampleDataDirectory()}/sample2.csv`]
    const options = [
      this.translationData.selectData, this.translationData.selectOpt1, this.translationData.selectOpt2
    ]

    options.forEach( (val, idx) => {
      const option = document.createElement("option", {});
      option.setAttribute("value", paths[idx]);
      option.innerText = val;
      this.elements.sampleDataSelectionDropdown.appendChild(option);
    })

  }

  loadChartLabels() {
    Object.keys(this.charts).forEach((name, idx) => {
      this.charts[name].chart.options.scales.xAxes[0].scaleLabel.labelString = (idx < 2)
        ? this.translationData.xAxisTitle1
        : this.translationData.xAxisTitle2;
      this.charts[name].chart.options.scales.yAxes[0].scaleLabel.labelString = this.translationData.yAxisTitle;
    });

    this.charts.coverageCI.setAxisLabels(this.translationData.AxisIntervals, this.translationData.AxisMeans)
  }

  renderSampleDataSelectionCallBackFunc() {
    let render = (event) => {
      //get the selected sample data option
      const selectedSampleDataOption = this.elements.sampleDataSelectionDropdown.value
      //if (selectedSampleDataOption !== "Select Sample Data") {
      if (selectedSampleDataOption !== this.translationData.selectData) {
        //readLocalFile(this.sampleDataOptions[selectedSampleDataOption]).then(
        readLocalFile(selectedSampleDataOption).then(
          data => this.elements.csvDataTextArea.value = data
        )
      } else {
        this.elements.csvDataTextArea.value = ""
      }

      event.preventDefault()
    }
    return render
  }
  loadDataButtonCallBackFunc() {
    let loadDataBtn = (event) => {
      // get the data
      const rawData = this.elements.csvDataTextArea.value
      const cleanedData = parseCSVtoSingleArray(rawData)
      const freqs = computeFrequencies(extractDataByColumn(cleanedData, "value"))
      if (!this.originalData || !computeDataSimilarity(this.originalDataFreqs, freqs)) {
        this.originalData = cleanedData
        this.originalDataFreqs = freqs
        this.shiftMean = 0
        this.multiplyFactor = 0
        this.sampleSize = 10
        this.numOfSamples = 1
        this.confidenceLevel = 95
        this.updateData(this.dataSections.originalData)
        this.clearResult()
        //this.updatePopulationData()
      }
      this.clearResult()

      event.preventDefault()
    }
    return loadDataBtn
  }
  runSimulationCallBackFunc() {
    let runSimulationBtn = (event) => {
      const sampleSize = Number(this.elements.sampleSizeInput.value) || 10
      const numberOfSamples = Number(this.elements.numberOfSamplesInput.value) || 1
      this.runSimulation(sampleSize, numberOfSamples)
      this.tenthSampleMeans = Math.ceil(this.sampleMeans.length * 0.1)
      this.disableControlsCoverageMeans(false)
      event.preventDefault()
    }
    return runSimulationBtn
  }
  resetButtonCallBackFunc() {
    let resetDataBtn = (event) => {
      this.elements.csvDataTextArea.value = ""
      this.originalData = []
      this.originalDataFreqs = []
      this.shiftMean = 0
      this.multiplyFactor = 0
      this.sampleSize = 10
      this.numOfSamples = 1
      this.confidenceLevel = 95
      this.elements.size.innerText = 0
      this.elements.sampleDataSelectionDropdown.selectedIndex = 0
      this.updateData(this.dataSections.originalData)
      this.clearResult()
      //this.updatePopulationData()

      this.clearResult()

      event.preventDefault()
    }
    return resetDataBtn
  }
  addBuildCoveragesCallBackFunc() {
    let buildCovMeansBtn = (event) => {
      this.updateCoverageMeans()
      event.preventDefault()
    }
    return buildCovMeansBtn
  }
  /*includeValueIntervalCallBackFunc(){
    let includeValBtn = (event) => {
      if (this.sampleMeans.length)  this.updateData(this.dataSections.confidenceIntervalSection)
    }
    return includeValBtn
  }*/

  intervalLimitsControl(){
    const extremes = [
      MathUtil.minInArray(this.sampleMeans),
      MathUtil.maxInArray(this.sampleMeans)
    ];
    this.elements.minInterValInput.min = (extremes[0]%1 === 0)?
    extremes[0] : Math.floor(extremes[0]);
    this.elements.minInterValInput.max = this.elements.maxInterValInput.value;
    this.elements.maxInterValInput.min = this.elements.minInterValInput.value;
    this.elements.maxInterValInput.max = (extremes[1]%1 === 0)?
    extremes[1] : Math.ceil(extremes[1]);
  }

  runSimulation(sampleSize, numberOfSamples) {
    let newSamples = [[], []]
    try {
      //if (this.populationData.length < sampleSize) throw this.translationData.errorNoPopulation;
      if (this.originalData.length < sampleSize) throw this.translationData.errorNoPopulation;
      for (let i = 0; i < numberOfSamples; i++) {
        //let newSample = randomSubset(this.populationData, sampleSize)
        let newSample = randomSubset(this.originalData, sampleSize)
        newSample = newSample.chosen

        const chosenMean = MathUtil.roundToPlaces(MathUtil.mean(extractDataByColumn(newSample, "value")), 4)
        const chosenStd = MathUtil.roundToPlaces(MathUtil.sampleStddev(extractDataByColumn(newSample, "value")), 4)
        newSamples[0].push(chosenMean)
        newSamples[1].push(chosenStd)
        if (i === numberOfSamples - 1) {
          this.latestSampleDraw = newSample
        }
      }
      if (this.sampleSize !== sampleSize) {
        this.sampleSize = sampleSize
        this.sampleMeans = newSamples[0]
        this.sampleStd = newSamples[1]
      } else {
        this.sampleMeans = this.sampleMeans.concat(newSamples[0])
        this.sampleStd = this.sampleStd.concat(newSamples[1])
      }
      this.updateData(this.dataSections.sampleDrawSection)
      const minNumber = MathUtil.minInArray(this.sampleMeans);
      const maxNumber = MathUtil.maxInArray(this.sampleMeans);
      this.elements.minInterValInput.value = (minNumber%1===0)?minNumber-1:Math.floor(minNumber);
      this.elements.maxInterValInput.value = (maxNumber%1===0)?maxNumber+1:Math.ceil(maxNumber);
      this.updateData(this.dataSections.confidenceIntervalSection)

    } catch (err) {
      let errMsg = "ERROR\n"
      /*if (this.populationData.length)
        errMsg += this.translationData.errorNotEnoughElements;
      else*/
        errMsg += this.translationData.errorNoPopulation;
      this.elements.sampleDrawSimError.innerText = errMsg;
      setTimeout(() => {
        this.elements.sampleDrawSimError.innerText = "";
      }, 2000);

    }
  }
  clearResult() {
    this.disableControlsCoverageMeans(true)
    this.charts.coverageCI.clear()
    this.charts.coverageCI.chart.update()
    /*this.elements.shiftMeanInput.value = this.shiftMean
    this.elements.multiplyPopulationDataSlider.value = this.multiplyFactor
    this.elements.multiplyPopulationDataDisplay.innerText = this.multiplyFactor*/
    this.elements.sampleSizeInput.value = this.sampleSize
    this.elements.numberOfSamplesInput.value = this.numOfSamples
    //this.elements.confidenceLevelDisplay.innerText = this.confidenceLevel
    //this.elements.confidenceLevelSlider.value = this.confidenceLevel
    this.latestSampleDraw = []
    this.sampleMeans = []
    this.updateData(this.dataSections.sampleDrawSection)
    this.updateData(this.dataSections.confidenceIntervalSection)
    this.updateConfidenceIntervalChartLabel("null", "null")
    /*this.elements.lower.innerText = this.translationData.noData
    this.elements.upper.innerText = this.translationData.noData*/

  }
  disableControlsCoverageMeans(flag) {
    this.elements.noOfCoveragesInput.disabled = flag
    this.elements.buildCovBtn.disabled = flag
    this.elements.noOfCoveragesInput.value = flag ? '' : this.tenthSampleMeans
    this.elements.coverageWithMean.innerText = this.translationData.noData
    this.elements.coverageWithoutMean.innerText = this.translationData.noData
    this.elements.samplesMeanCoverageDisplay.value = ''
    this.charts.coverageCI.chart.data.datasets[2].label = this.charMu

  }
  predicateForSets(left, right) {
    if (this.intervalType.left && this.intervalType.right){
      return function(x) {
        return x >= left && x <= right;
      }
    } else if (this.intervalType.left && !this.intervalType.right){
      return function(x) {
        return x >= left && x < right;
      }
    } else if (!this.intervalType.left && this.intervalType.right){
      return function(x) {
        return x > left && x <= right;
      }
    } else if (!this.intervalType.left && !this.intervalType.right){
      return function(x) {
        return x > left && x < right;
      }
    } else return null;
  }

  /*updatePopulationData() {
    this.populationData = []

    this.originalData.forEach(row => {
      let startID = this.multiplyFactor === 0 ? row.id : (row.id * this.multiplyFactor) - (this.multiplyFactor - 1) + (row.id - 1)
      for (let i = 0; i <= this.multiplyFactor; i++) {
        this.populationData.push({ id: startID + i, value: MathUtil.roundToPlaces(row.value + this.shiftMean, 4) })
      }
    })
    this.updateData(this.dataSections.hypotheticalPopulationData)
  }*/
  updateData(dataSectioName) {
    let [data, meanElement, dataStringTextAreaElement, chart] = [undefined, undefined, undefined, undefined]
    if (dataSectioName === this.dataSections.originalData) {
      chart = this.charts.originalDataChart
      data = this.originalData
      meanElement = this.elements.originalDataMeanDisplay
      dataStringTextAreaElement = this.elements.originalDataTextArea
      this.elements.size.innerText = data.length
      this.updateStandardDeviation(this.elements.originalDataStandardDeviationDisplay, extractDataByColumn(data, "value"))
    } /*else if (dataSectioName === this.dataSections.hypotheticalPopulationData) {
      chart = this.charts.hypotheticalPopulationChart
      data = this.populationData
      meanElement = this.elements.populationDataMean
      dataStringTextAreaElement = this.elements.populationDataTextArea
      this.updateStandardDeviation(this.elements.populationDataSTD, extractDataByColumn(data, "value"))
    }*/ else if (dataSectioName === this.dataSections.sampleDrawSection) {
      chart = this.charts.sampleDrawChart
      data = this.latestSampleDraw
      meanElement = this.elements.sampleDrawMean
      dataStringTextAreaElement = this.elements.sampleDrawTextArea
      //this.updateStandardDeviation(this.elements.sampleDrawSTD, extractDataByColumn(data, 'value'))
      this.elements.sampleDrawSTD.innerText = this.sampleStd[this.sampleStd.length - 1]

    } else {
      chart = this.charts.confidenceIntervalChart
      data = this.sampleMeans
      meanElement = this.elements.sampleMeansMean
      dataStringTextAreaElement = this.elements.samplesMeanTextArea
      this.elements.totalSampleMeans.innerText = this.sampleMeans.length
      this.updateStandardDeviation(this.elements.sampleMeansSTD, data)
      this.intervalType = {
        left: this.elements.includeValMin.checked, right: this.elements.includeValMax.checked
      }

    }
    let pointRadius = 6;
    let values = undefined;
    if (chart) {
      if (data.length > 0) {
        if (dataSectioName !== this.dataSections.confidenceIntervalSection) {
          values = extractDataByColumn(data, "value")
          chart.setDataFromRaw([values])
        } else {
          values = data
          /*const confidenceInterval = MathUtil.getCutOffInterval(this.confidenceLevel, this.sampleMeans.length)
          let [leftBound, rightBound] = confidenceInterval
          const temp = this.sampleMeans.map(val => val)
          temp.sort((a, b) => a - b)*/

          const leftBound = Number(this.elements.minInterValInput.value)
          const rightBound = Number(this.elements.maxInterValInput.value)

          const { chosen, unchosen } = splitByPredicate(
            values,
            this.predicateForSets(leftBound, rightBound)
          );

          /*let [chosen, unchosen] = splitUsing(temp, this.getPredicateFunction(leftBound, rightBound, temp))
          this.elements.lower.innerText = temp[leftBound]
          this.elements.upper.innerText = temp[rightBound >= temp.length ? rightBound - 1 : rightBound]*/
          this.updateInfoSampleMeans(chosen.length, unchosen.length);
          chart.setDataFromRaw([chosen, unchosen])
          //this.updateConfidenceIntervalChartLabel(temp[leftBound], temp[rightBound >= temp.length ? rightBound - 1 : rightBound])
          if (chosen.length)
            this.updateConfidenceIntervalChartLabel(
              MathUtil.roundToPlaces(MathUtil.minInArray(chosen), 4),
              MathUtil.roundToPlaces(MathUtil.maxInArray(chosen), 4)
            )
          else
            this.updateConfidenceIntervalChartLabel(
              MathUtil.roundToPlaces(leftBound, 4),
              MathUtil.roundToPlaces(rightBound, 4)
            )

          pointRadius = 4

        }


        chart.changeDotAppearance(pointRadius, undefined)
        let [min, max] = [MathUtil.minInArray(values), MathUtil.maxInArray(values)]
        chart.setScale(min, max)
      } else {
        chart.clear()
      }
      chart.scaleToStackDots()
      chart.chart.update()

    }

    this.updateMean(meanElement, dataSectioName !== this.dataSections.confidenceIntervalSection ? extractDataByColumn(data, "value") : data)
    let dataTransformationFunc = null
    if (dataSectioName !== this.dataSections.confidenceIntervalSection) {
      dataTransformationFunc = () => {
        return data.reduce(
          (currString, currentRow) => currString + `${currentRow.id}`.padEnd(8, ' ') + `${currentRow.value}\n`,
          `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.value}\n`

        )
      }
    } else {
      dataTransformationFunc = () => {
        return data.reduce(
          (currString, currentRow, index) => currString + `${index + 1}`.padEnd(8, ' ') + `${currentRow}\n`,
          `${this.translationData.id}`.padEnd(8, ' ') + `${this.translationData.mean}\n`
        )
      }
    }
    this.updateDataTextArea(dataTransformationFunc, dataStringTextAreaElement)
  }
  updateStandardDeviation(standardDeviationDisplay, data) {
    const stddev = data.length > 0 ? MathUtil.stddev(data) : getDefaultValues().standardDeviation
    standardDeviationDisplay.innerText = MathUtil.roundToPlaces(stddev, 2)
  }
  updateMean(meanDisplayElement, data) {
    const mean = data.length > 0 ? MathUtil.mean(data) : getDefaultValues().mean
    meanDisplayElement.innerText = MathUtil.roundToPlaces(mean, 2)

  }
  updateDataTextArea(transform, dataTextAreaElement) {
    const dataString = transform()
    dataTextAreaElement.value = dataString
  }
  getPredicateFunction(leftBound, rightBound, temp) {
    let predictateFunction = (value, index) => {
      return value >= temp[leftBound] && value <= temp[rightBound >= temp.length ? rightBound - 1 : rightBound]
    }
    return predictateFunction
  }
  updateConfidenceIntervalChartLabel(leftBound, rightBound) {
    if (leftBound === "null" || rightBound === "null") {
      this.charts.confidenceIntervalChart.updateLabelName(0, this.translationData.InInterval)
      this.charts.confidenceIntervalChart.updateLabelName(1, this.translationData.NotInInterval)
    } else {
      let intervalStr = ""
      
      if (this.intervalType.left && this.intervalType.right)  intervalStr = `[${leftBound}, ${rightBound}]`
      else if (this.intervalType.left && !this.intervalType.right)  intervalStr = `[${leftBound}, ${rightBound})`
      else if (!this.intervalType.left && this.intervalType.right) intervalStr = `(${leftBound}, ${rightBound}]`
      else  intervalStr = `(${leftBound}, ${rightBound})`

      this.charts.confidenceIntervalChart.updateLabelName(0, `${this.translationData.InInterval} ${intervalStr}`)
      this.charts.confidenceIntervalChart.updateLabelName(1, `${this.translationData.NotInInterval} ${intervalStr}`)
    }
  }

  updateInfoSampleMeans(totalChosen, totalUnchosen){
    const proportionChosen = MathUtil.roundToPlaces(totalChosen / this.sampleMeans.length, 4);
    const proportionUnchosen = MathUtil.roundToPlaces(totalUnchosen / this.sampleMeans.length, 4);
    this.elements.totalSampleMeans.innerText = this.sampleMeans.length;
    this.elements.chosenSampleMeans.innerText = `${totalChosen} / ${this.sampleMeans.length} = ${proportionChosen}`;
    this.elements.unchosenSampleMeans.innerText = `${totalUnchosen} / ${this.sampleMeans.length} = ${proportionUnchosen}`;
  }

  updateCoverageMeans() {
    let chosenMeans = [], processedStd = []//, idxArr = [];
    const noOfCoverage = Number(this.elements.noOfCoveragesInput.value)
    //for (let it = 0; it < this.sampleMeans.length; it++) {
      //idxArr.push(it)
      for (let it = 0; it < noOfCoverage; it++) {
      chosenMeans.push(this.sampleMeans[it])
      processedStd.push(2 * this.sampleStd[it] / Math.sqrt(this.sampleSize))
    }


    /*try {
      if ((noOfCoverage > 100) || (this.tenthSampleMeans > 100)) throw this.translationData.coverageOverflow

      const { chosen, _ } = randomSubset(idxArr, noOfCoverage)

      chosen.sort().forEach(ele => {
        chosenMeans.push(this.sampleMeans[ele])
        processedStd.push(2 * this.sampleStd[ele] / Math.sqrt(this.sampleSize))
      })*/


      let it, sampleMean, procStd, lower, upper, minNum, maxNum, assignedDataset, tmp
      let inInterval = [], notInInterval = [], lowers = [], uppers = []
      let wMean = 0
      //const centMean = chosenMeans[chosenMeans.length - 1]
      const centMean = Number(this.elements.originalDataMeanDisplay.innerText)

      for (it = 0; it < chosenMeans.length; it++) {
        sampleMean = chosenMeans[it]
        procStd = processedStd[it]
        // Confidence Interval Formula
        // x_bar +/- ( 2 * sample_std / sqrt(sample size) )
        lower = sampleMean - procStd
        upper = sampleMean + procStd
        if (lower < minNum || !minNum) minNum = lower
        if (upper > maxNum || !maxNum) maxNum = upper

        if (lower <= centMean && centMean <= upper) wMean += 1

        if ((it < noOfCoverage) && (it < 100)){
          assignedDataset = (lower <= centMean && centMean <= upper) ? inInterval : notInInterval

          assignedDataset.push(
            { x: it + 1, y: MathUtil.roundToPlaces(lower, 2) },
            { x: it + 1, y: sampleMean },
            { x: it + 1, y: MathUtil.roundToPlaces(upper, 2) },
            { x: undefined, y: undefined }
          )
        }
        
        lowers.push(MathUtil.roundToPlaces(lower, 2))
        uppers.push(MathUtil.roundToPlaces(upper, 2))
      }
      it++
      tmp = inInterval.pop()
      tmp = notInInterval.pop()
      this.charts.coverageCI.setScales({
        x_term: (it < 100) ? it : 100,
        y_init: minNum,//(minNum % 1) ? Math.floor(minNum) : minNum - 1,
        y_term: maxNum//(maxNum % 1) ? Math.ceil(maxNum) : maxNum + 1
      })

      
      this.charts.coverageCI.updateChartData([
        inInterval,
        notInInterval,
        [{x: 0, y: centMean}, {x: (it < 100) ? it : 100, y: centMean}]
        //chosenMeans, processedStd, Number(this.elements.originalDataMeanDisplay.innerText)
      ])

      this.charts.coverageCI.chart.data.datasets[2].label = `${this.charMu} = ${centMean}`
      this.charts.coverageCI.chart.update()

      /*const withMean = (this.charts.coverageCI.chart.data.datasets[0].data.length + 1) / 4
      const withoutMean = (this.charts.coverageCI.chart.data.datasets[1].data.length) ?
      (this.charts.coverageCI.chart.data.datasets[1].data.length + 1) / 4 : 0
      const withoutMean = noOfCoverage - withMean*/

      this.elements.coverageWithMean.innerText = wMean //withMean
      this.elements.coverageWithoutMean.innerText = noOfCoverage - wMean //withoutMean

      /* Build results table
      this.elements.samplesMeanCoverageDisplay.innerHTML = ""
      this.elements.samplesMeanCoverageTable.innerText = this.translationData.displaySMTitle
      const tableHead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headersTable = [
        this.translationData.id,
        this.translationData.lowerLimit,
        "x&#772;",
        this.translationData.upperLimit
      ]
      headersTable.forEach(x => {
        const tHead = document.createElement("th");
        tHead.innerHTML = x;
        headerRow.appendChild(tHead);
      })
      tableHead.appendChild(headerRow);
      const bodyTable = document.createElement("tbody");
      chosenMeans.forEach((val, idx) => {
        const rowData = document.createElement("tr");
        const tableRow = [
          idxArr[idx]+1, lowers[idx].toFixed(2), val.toFixed(2), uppers[idx].toFixed(2)
        ];
        tableRow.forEach(x => {
            const element = document.createElement("td");
            element.innerText = x;
            rowData.appendChild(element);
        });
        bodyTable.appendChild(rowData);
      });
      this.elements.samplesMeanCoverageDisplay.appendChild(tableHead);
      this.elements.samplesMeanCoverageDisplay.appendChild(bodyTable);*/

      this.elements.samplesMeanCoverageDisplay.value = chosenMeans.reduce((prev, val, idx) => 
      prev + `${idx}`.padEnd(5, ' ') + `${lowers[idx].toFixed(2)}`.padEnd(8, ' ') + `${val}`.padEnd(6, ' ') + `${uppers[idx].toFixed(2)}\n`,
      `${this.translationData.id}`.padEnd(5, ' ') + `${this.translationData.lowerLimit}`.padEnd(8, ' ') + `${this.translationData.mean}`.padEnd(6, ' ') + `${this.translationData.lowerLimit}\n`
      )

    /*} catch (err) {
      let msg = this.translationData.warning + "Hola"
      this.elements.coveragesMsg.innerText = msg + err;
      setTimeout(() => {
        this.elements.coveragesMsg.innerText = "";
      }, 2000);
    }*/




  }
}
