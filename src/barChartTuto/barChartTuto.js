---
---
import {
    dropTextFileOnTextArea,
    parseCSVtoSingleArray,
    readLocalFile,
    enableUploadDataFile
} from "{{base}}../util/csv.js";
import { sortAlphaNumString } from "{{base}}../util/utilities.js"
import barChart from "{{base}}../util/barChart.js";
import translation from "{{base}}../util/translate.js";
import { randomSubset } from "{{base}}../util/sampling.js";
import {roundToPlaces, maxInArray} from "{{base}}../util/math.js";

export class BarChartTuto {
    // Clase constructora
    constructor(BarChartTutoDiv){
        this.barTranslation     = translation.barChartTuto;
        this.inputDataArray     = [];
        this.dataCategoryArray  = [];
        this.sampleDataArray    = [];
        this.sampleDataList     = {
            default:    null,
            option1:    "../sampleData/barSample1.csv",
            option2:    "../sampleData/barSample2.csv"
        };
        this.datasets = [
            {
                label:              this.barTranslation.inputDataLabel,
                borderColor:        "orange",
                backgroundColor:    "orange",
                data:               []
            },
            {
                label:              this.barTranslation.sampleDataLabel,
                borderColor:        "blue",
                backgroundColor:    "blue",
                data:                []
            }
        ];
        this.elem = {
            sampleDataDropDown:     BarChartTutoDiv.querySelector("#sample-data-options"),
            csvTextArea:            BarChartTutoDiv.querySelector("#csv-input"),
            loadDataBtn:            BarChartTutoDiv.querySelector("#load-data-btn"),
            resetBtn:               BarChartTutoDiv.querySelector("#reset-btn"),
            uploadBtn:              BarChartTutoDiv.querySelector("#upload-btn"),
            fileInput:              BarChartTutoDiv.querySelector("#fileInput"),
            inputErrorMsg:          BarChartTutoDiv.querySelector("#input-error-msg"),
            inputDataSizeNum:       BarChartTutoDiv.querySelector("#input-data-size-number"),
            inputDataTable:         BarChartTutoDiv.querySelector("#input-data-table"),
            inputDataDisplay:       BarChartTutoDiv.querySelector("#input-data-display"),
            sampleSizeInput:        BarChartTutoDiv.querySelector("#sample-size"),
            getSampleBtn:           BarChartTutoDiv.querySelector("#get-sample-btn"),
            sampleDataSizeNum:      BarChartTutoDiv.querySelector("#sample-data-size-number"),
            getSampleErrorMsg:      BarChartTutoDiv.querySelector("#get-sample-error-msg"),
            sampleDataTable:        BarChartTutoDiv.querySelector("#sample-data-table"),
            sampleDataDisplay:      BarChartTutoDiv.querySelector("#sample-data-display")
        };
        this.inputChart = new barChart(
            BarChartTutoDiv.querySelector("#input-chart"),
            [this.datasets[0]],
            this.barTranslation
        );
        this.sampleChart = new barChart(
            BarChartTutoDiv.querySelector("#sample-chart"),
            [this.datasets[1]],
            this.barTranslation
        );
        // Habilitar entrada de datos a través de datos externos
        enableUploadDataFile(this.elem.uploadBtn, this.elem.fileInput, this.elem.csvTextArea);
        this.loadEventListener = () => {
            this.elem.sampleDataDropDown.addEventListener("change", () => {
                const nameOption = this.elem.sampleDataDropDown.value;
                if (nameOption != this.barTranslation.selectData) {
                    readLocalFile(this.sampleDataList[nameOption]).then(
                        text => (this.elem.csvTextArea.value = text)
                    );
                } else  this.elem.csvTextArea.value = "";
            });
            this.elem.loadDataBtn.addEventListener("click", ev => {
                this.inputDataArray = this.elem.csvTextArea.value.split(/\r?\n+|\r+/).filter(
                    x => /\w+/.test(x)
                ).map(
                    (x, index) => ({
                        id: index + 1,
                        //value: x.match(/\w+/)[0]
                        value: x.match(/-?\w*\.?\w+/)[0]
                    })
                );
                if (this.inputDataArray.length) this.loadInputData();
                else this.totalReset();
                ev.preventDefault();
            });
            this.elem.resetBtn.addEventListener("click", ev => {
                this.totalReset();
                ev.preventDefault();
            });
            this.elem.getSampleBtn.addEventListener("click", ev => {
                this.updateSampleData(Number(this.elem.sampleSizeInput.value));
                ev.preventDefault();
            })
            dropTextFileOnTextArea(this.elem.csvTextArea);
        };
        this.loadSampleDataList();
        this.loadEventListener();
    }

    loadSampleDataList(){
        const title = [
            this.barTranslation.selectData,
            this.barTranslation.selectOpt1,
            this.barTranslation.selectOpt2
        ]
        Object.keys(this.sampleDataList).forEach((val, idx) => {
            const option = document.createElement("option", {});
            option.setAttribute("value", val);
            option.innerText = title[idx];
            this.elem.sampleDataDropDown.appendChild(option);
        })
    }

    totalReset(){
        this.inputDataArray =[];
        this.elem.sampleDataDropDown.selectedIndex = 0;
        this.elem.csvTextArea.value = "";
        this.elem.inputDataSizeNum.innerText = this.barTranslation.noData;
        this.elem.inputDataTable.innerText = ""
        this.elem.inputDataDisplay.innerHTML = "";
        this.inputChart.clearChart();
        this.resetSampleChart();
        this.elem.sampleSizeInput.disabled = true;
        this.elem.getSampleBtn.disabled = true;
    }

    resetSampleChart(){
        this.sampleDataArray = [];
        this.elem.sampleSizeInput.value = '';
        this.elem.sampleDataSizeNum.innerText = this.barTranslation.noData;
        this.sampleChart.clearChart();
        this.elem.sampleDataTable.innerText = "";
        this.elem.sampleDataDisplay.innerHTML = '';
    }

    updateSampleData(sampleSize){
        //let sampleArray = [];
        try {
            if (!this.inputDataArray.length) throw this.barTranslation.errorNoPopulation;
            const {chosen, unchosen} = randomSubset(this.inputDataArray, sampleSize);
            this.sampleDataArray = chosen;
        } catch (error) {
            let errMsg ="ERROR\n"
            this.elem.getSampleErrorMsg.innerText= errMsg;
        }
        this.updateData(1);
    }

    loadInputData(){
        this.resetSampleChart();
        let valuesArr           = [...this.inputDataArray.map(x => x.value)];
        this.dataCategoryArray  = sortAlphaNumString([... new Set(valuesArr)]);
        try {
            if (this.dataCategoryArray.length >15) throw this.barTranslation.errOverflow
            this.updateData(0);
            this.elem.sampleSizeInput.disabled = false;
            this.elem.getSampleBtn.disabled = false;
            this.elem.sampleSizeInput.value = Math.ceil(valuesArr.length*0.1)
        } catch (error) {
            this.elem.inputErrorMsg.innerText = 'ERROR\n' + error;
            setTimeout( () => this.elem.inputErrorMsg.innerText = '', 5000);
        }
    }

    setMaxScale(num){
        if (num<1)  return Math.floor((num - Math.floor(num))*10)/10 + 0.1;
        else        return 1
    }

    updateData(num){
        let chart, dataArray, dataDisplay, dataSize; 
        if (num === 0) {
            chart       = this.inputChart;
            dataArray   = this.inputDataArray;
            dataDisplay = this.elem.inputDataDisplay;
            dataSize    = this.elem.inputDataSizeNum;
            this.elem.inputDataTable.innerText = this.barTranslation.displayCategoryTitle;
        } else {
            chart       = this.sampleChart;
            dataArray   = this.sampleDataArray;
            dataDisplay = this.elem.sampleDataDisplay;
            dataSize    = this.elem.sampleDataSizeNum;
            this.elem.sampleDataTable.innerText = this.barTranslation.displayCategoryTitle;
        }
        let valuesArr   = [...dataArray.map(x => x.value)];
        let contValues  = this.dataCategoryArray.map(x => (
            valuesArr.filter(val => (x===val)).length
        ));
        let relativesVal = [
            ...contValues.map(x => roundToPlaces(x/valuesArr.length, 4))
        ];

        chart.updateChartData(this.dataCategoryArray, relativesVal);
        chart.setScale(0, this.setMaxScale(maxInArray(relativesVal)));
        /*
        dataDisplay.value = this.dataCategoryArray.reduce(
            (acc, val, idx) =>
            acc + `${idx+1}`.padEnd(5, ' ') + val.padEnd(16, ' ') +
            `${contValues[idx]}`.padEnd(20, ' ') + relativesVal[idx] + '\n',
            this.barTranslation.idx.padEnd(5, ' ') + this.barTranslation.category.padEnd(16, ' ')
            + this.barTranslation.absFreq.padEnd(20, ' ') + this.barTranslation.relFreq+'\n'
        );
        this.loadFrequencyTable(contValues, relativesVal);*/
        dataSize.innerText = valuesArr.length;
        // load data table
        dataDisplay.innerHTML = "";
        const tableHead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const headersTable = [
            this.barTranslation.idx,
            this.barTranslation.category,
            this.barTranslation.absFreq,
            this.barTranslation.relFreq
        ]
        headersTable.forEach(x => {
            const tHead = document.createElement("th");
            tHead.innerText = x;
            headerRow.appendChild(tHead);
        })
        tableHead.appendChild(headerRow);
        const bodyTable = document.createElement("tbody");
        this.dataCategoryArray.forEach((val, idx) => {
            const rowData = document.createElement("tr");
            const tableRow = [idx+1, val, contValues[idx], relativesVal[idx].toFixed(4)];
            tableRow.forEach(x => {
                const element = document.createElement("td");
                element.innerText = x;
                rowData.appendChild(element);
            });
            bodyTable.appendChild(rowData);
        });
        dataDisplay.appendChild(tableHead);
        dataDisplay.appendChild(bodyTable);
    }
}