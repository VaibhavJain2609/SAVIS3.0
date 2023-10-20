---
---

import {countWhere, roundToPlaces, mean, stddev, getCutOffInterval} from "{{base}}../util/math.js";
import {splitByPredicate, randomSubset, shuffle, splitUsing} from "{{base}}../util/sampling.js";
import StackedDotChart from "../util/stackeddotchart.js";
import * as Summaries from "{{base}}../util/summaries.js";
import OnePropChart from "{{base}}./onePropChart.js";
import translation from "{{base}}../util/translate.js";

export class OneProportion {

  constructor(onePropDiv) {
    this.dom = {
      onePropDiv,
      success: onePropDiv.querySelector('#success'),
      failure: onePropDiv.querySelector('#failure'),
      inputCanvas: onePropDiv.querySelector("#input-bars"),
      lastSimCanvas: onePropDiv.querySelector("#last-sim-bars"),
      numSimulations: onePropDiv.querySelector('#num-simulations'),
      needData: onePropDiv.querySelectorAll('[disabled=need-data]'),
      needResults: onePropDiv.querySelectorAll('[disabled=need-results]'),
      chartEle: onePropDiv.querySelector("#ci-chart"),
      customChart: onePropDiv.querySelector("#custom-interval"),
      ciElement: onePropDiv.querySelector("#confidence-level"),
      ciDisplay: onePropDiv.querySelector("#confidence-level-display"),
      minTailValInput: onePropDiv.querySelector("#min-tailValue"),
      maxTailValInput: onePropDiv.querySelector("#max-tailValue"),
      includeValMin: onePropDiv.querySelector("#includeMin"),
      includeValMax: onePropDiv.querySelector("#includeMax"),
      //buildCi: onePropDiv.querySelector("#buildci"),
      sampleSizeInput: onePropDiv.querySelector('#sample-size')
      //increment: onePropDiv.querySelector("#increment"),
      //incrementButton: onePropDiv.querySelector("#incrementButton")
      
    };
    this.numsuccess = null
    this.numfailure = null
    this.translation = translation.oneProportion
    this.noData = this.translation.noData
    this.summaryElements = Summaries.loadSummaryElements(onePropDiv);
    this.sampleSize
    this.simulations = []
    this.dataElements = [
      {label: this.translation.InInterval, backgroundColor: 'green', data: []},
      {label: this.translation.NotInInterval, backgroundColor: 'red', data: []}
    ]
    this.charts = {
      inputChart: new OnePropChart(this.dom.inputCanvas),
      lastSimChart: new OnePropChart(this.dom.lastSimCanvas),
      ciChart: new StackedDotChart(this.dom.chartEle, this.dataElements),
      customChart: new StackedDotChart(this.dom.customChart, this.dataElements)
   
    };
    this.charts.ciChart.setAnimationDuration(0)
    this.charts.customChart.setAnimationDuration(0)
    this.charts.ciChart.setAxisLabels(this.translation.xAxisTitle2, this.translation.yAxisTitle2)
    this.charts.customChart.setAxisLabels(this.translation.xAxisTitle2, this.translation.yAxisTitle2)
    this.dom.ciElement.addEventListener("input", event => {
      //this.dom.ciDisplay.innerText = this.dom.ciElement.value
      this.updateLatestCharts()
      event.preventDefault()
    })
    this.dom.minTailValInput.addEventListener("input", e => {
      this.updateLatestCharts()
      this.dom.minTailValInput.max = this.dom.maxTailValInput.value
      this.dom.maxTailValInput.min = this.dom.minTailValInput.value
    })
    this.dom.maxTailValInput.addEventListener("input", e => {
      this.updateLatestCharts()
      this.dom.minTailValInput.max = this.dom.maxTailValInput.value
      this.dom.maxTailValInput.min = this.dom.minTailValInput.value
    })
    this.dom.includeValMin.addEventListener("click", e => {
      if (this.simulations.length) this.updateLatestCharts()
    })
    this.dom.includeValMax.addEventListener("click", e => {
      if (this.simulations.length) this.updateLatestCharts()
    })
    /*this.dom.buildCi.addEventListener('click', event => {
      if(!this.validateIncrement()){
        alert(this.translation.incrementWarning)
        return 
      }
      this.updateLatestCharts()

      event.preventDefault()
    })*/
    /*this.dom.incrementButton.addEventListener('click', event => {
      const factor = Number(this.dom.increment.value)
      this.increment(factor)
      event.preventDefault()
    })*/
   

  }
  increment(factor){
    
    if(this.data && this.data.numfailure > 0 && this.data.numsuccess > 0 && factor > 0){
      this.data.numfailure = this.numfailure * factor
      this.data.numsuccess = this.numsuccess * factor
      //this.resetLastChart()
      this.resetLatestCharts()
      this.updateBase()
      const summary = {
        numsuccess: this.data.numsuccess, numfailure: this.data.numfailure,
        ...this.resetAllBut(["numsuccess", "numfailure","proportion"])
      }
      Summaries.updateSummaryElements(this.summaryElements, summary);
    }else{
      if(this.numfailure == 0 || this.numsuccess == 0){
        if(factor == 0){
          alert(this.translation.incrementZeroWarning)
        }
      }else{
        if(factor == 0 )
          alert(this.translation.incrementZeroWarning)

      }
    }
  }

  disabledSimulationSection(flag){
    for (let elem of this.dom.needData) elem.disabled = flag
    this.dom.sampleSizeInput.value = flag ?
    '' : Math.ceil((this.numfailure + this.numsuccess) * 0.1)
    this.dom.numSimulations.value = flag ? '' : 1
  }

  disabledLatestChartsSection(flag){
    for (let elem of this.dom.needResults)  elem.disabled = flag
    this.dom.minTailValInput.value = flag ? "" : 0
    this.dom.maxTailValInput.value = flag ? "" : 1
    this.dom.minTailValInput.min = 0
    this.dom.minTailValInput.max = this.dom.maxTailValInput.value
    this.dom.minTailValInput.step = flag ? 1 : roundToPlaces(1 / this.dom.sampleSizeInput.value, 4)
    this.dom.maxTailValInput.min = this.dom.minTailValInput.value
    this.dom.maxTailValInput.max = 1
    this.dom.maxTailValInput.step = flag ? 1 : roundToPlaces(1 / this.dom.sampleSizeInput.value, 4)
    this.dom.ciElement.value = flag ? "" : 100 //Cambio 09/07/2023: 95
  }

  loadData() {
    let numsuccess = this.dom.success.value * 1;
    let numfailure = this.dom.failure.value * 1;
    if (numsuccess <= 0 || numfailure <= 0) {
      alert(translation.oneProportion.alertAtLeastOne);
    }
    else {
      /*this.resetLastChart()
      this.dom.increment.value = 0*/
      this.resetLatestCharts()
      let summary = {
        numsuccess, numfailure,
        proportion: numsuccess / (numsuccess + numfailure), // todo(matthewmerrill): fixed decimals
        ...this.resetAllBut(["numsuccess", "numfailure","proportion"])
        
      }
    
      Summaries.updateSummaryElements(this.summaryElements, summary);
      this.data = { numsuccess, numfailure};
      this.numfailure = numfailure
      this.numsuccess = numsuccess
      this.updateBase()
      this.disabledSimulationSection(false)
      /*{
        elem.removeAttribute('disabled');
      }*/
      /*for (let elem of this.dom.needResults){
        elem.setAttribute('disabled', true);  
      }*/
    }
  }

  resetAllBut(remove) {
    const keys = Object.keys(this.summaryElements)
    const result = {}
    keys.forEach(key => {
      if (!remove.includes(key)){
        result[key] = this.noData
      }
    })
    return result
  }
  /*validateIncrement(){
    if(this.data){
      if(this.data.numfailure == this.numfailure || this.data.numsuccess == this.numsuccess){
        return false
      }
    }
    return true
  }*/
  runSimulations() {
    /*if(!this.validateIncrement()){
      alert(this.translation.incrementWarning)
      return 
    }*/
    
    let numSimulations = Number(this.dom.numSimulations.value);
    let {numsuccess, numfailure} = this.data;
    let totalSuccess = numsuccess;
    let totalGroup = numsuccess + numfailure;
    const totalElements =  this.dom.sampleSizeInput.value //this.numfailure + this.numsuccess
    for (let simIdx = 0; simIdx < numSimulations; simIdx++) {
      
      let allItems = new Array(totalGroup);
      allItems.fill(0);
      allItems.fill(1, 0, totalSuccess);
      const shuffled = shuffle(allItems)
      const {chosen} = randomSubset(shuffled, totalElements)
      const samplesuccess = countWhere(chosen, data => data == 1)
      const samplefailure = totalElements - samplesuccess;      
      let sampleProportion = roundToPlaces(samplesuccess / totalElements, 4);
      if (this.sampleSize !== totalElements){
        this.sampleSize = totalElements
        this.sampleMeans  = []
      }
      this.simulations.push(sampleProportion)

      if (simIdx + 1 === numSimulations) {
        this.charts.lastSimChart.setProportions({
          numsuccess: samplesuccess,
          numfailure: samplefailure,
        });

        let summary = {
          samplesuccess, samplefailure,
          sampleProp: sampleProportion,
          mean: mean(this.simulations),
          stddev: stddev(this.simulations),
          total: this.simulations.length

        };
        Summaries.updateSummaryElements(this.summaryElements, summary);
        //this.updateLastChart()
      }
    }
    this.disabledLatestChartsSection(false)
    this.updateLatestCharts()
    this.charts.lastSimChart.update();

  }

  //updateLastChart(){
  updateLatestCharts(){
    // Confidence Interval Chart
    const confidenceLevel = Number(this.dom.ciElement.value) || 100 //Cambio 09/07/2023: 95
    if (confidenceLevel == 0) return  

    const [lower, upper] = getCutOffInterval(confidenceLevel, this.simulations.length)
    const temp = this.simulations.map(val => val)

    temp.sort((a, b) => a - b)
  
    const [chosen, unchosen] = splitUsing(temp, (val, index) => {
      return val >= temp[lower] &&  val <= temp[upper >= temp.length ? upper - 1: upper]
    })
  
    
    const summary ={
      lower: temp[lower], upper: temp[upper >= temp.length ? upper - 1: upper]
    }
    Summaries.updateSummaryElements(this.summaryElements, summary)
    //this.charts.ciChart.setScale(temp[0], temp[temp.length-1])

    this.charts.ciChart.setDataFromRaw([chosen, unchosen])
    this.charts.ciChart.scaleToStackDots()

    this.charts.ciChart.chart.update()

    // Custom Interval Chart
    const tmpChecked = {min: this.dom.includeValMin.checked, max: this.dom.includeValMax.checked}
    if (confidenceLevel == 100)  {
      this.dom.includeValMin.checked = true;
      this.dom.includeValMax.checked = true;
    }
    
    const dataCustomChart = splitByPredicate(
        this.simulations,
        this.predicateForTail(Number(this.dom.minTailValInput.value), Number(this.dom.maxTailValInput.value))
      );
    this.charts.customChart.setDataFromRaw([dataCustomChart.chosen, dataCustomChart.unchosen]);
    this.charts.customChart.scaleToStackDots()
    if (confidenceLevel == 100)  {
      this.dom.includeValMin.checked = tmpChecked.min;
      this.dom.includeValMax.checked = tmpChecked.max;
    }
    this.charts.customChart.chart.update()
  }

  //resetLastChart(){
  resetLatestCharts(){
    this.charts.ciChart.clear()
    this.charts.ciChart.chart.update()
    this.charts.customChart.clear()
    this.charts.customChart.chart.update()
    //this.dom.ciDisplay.innerText = ""
    this.dom.ciElement.value = ""
    this.simulations = []
  }
  updateBase() {
    this.charts.inputChart.setProportions(this.data);
    this.charts.inputChart.update();
    this.charts.lastSimChart.setProportions({
      numsuccess: 0, numfailure: 0
    });
    this.charts.lastSimChart.update();
  }
  predicateForTail(left, right) {
    const limits = {min: this.dom.includeValMin.checked, max: this.dom.includeValMax.checked}
    if (limits.min && limits.max) {
      return function (x) {
        return x >= left && x <= right;
      }
    } else if (limits.min && !limits.max) {
      return function (x) {
        return x >= left && x < right;
      }
    } else if (!limits.min && limits.max) {
      return function (x) {
        return x > left && x <= right;
      }
    } else if (!limits.min && !limits.max) {
      return function (x) {
        return x > left && x < right;
      }
    } else return null;
  }
}
