export function getSampleDataDirectory(){
  return  "../sampleData";
}


export function getDefaultValues(){
  return {
    mean: 'NaN',
    standardDeviation: 'NaN'
  }
}
export function extractDataByColumn(data, columnName){
    return data.map(row =>  row[columnName])
}
export function computeDataSimilarity(data1Frequencies, data2Frequencies){
    let data1Keys = Object.keys(data1Frequencies)
    let data2Keys = Object.keys(data2Frequencies)
    if (data1Keys.length !== data2Keys.length){
      return false;
    }
    for (let key of data2Keys){
      if (data1Frequencies[key] !==  data2Frequencies[key]){
        return false;
      }
    }
    return true;

}
export function computeFrequencies(data){
  let freqs = {}
  data.forEach((object) => {
    if (freqs.hasOwnProperty(object)){
      freqs[object] += 1
    }else{
      freqs[object] = 1
    }
  })
  return freqs
}

export function sortAlphaNumString(rawData) {
  let numbers = rawData.filter(x => !isNaN(Number(x))).sort((a,b)=>a-b).map(x => `${Number(x)}`);
  let strings = rawData.filter(x => isNaN(Number(x))).sort( (a,b) => a.localeCompare(b));
  console.log(numbers);
  console.log(typeof(numbers[3]))
  console.log(strings);
  
  // Para comprobar que los números esten completos
  const limit = numbers.length;
  for (let it=0; it<limit; it++){
    const rest = Number(numbers[it+1])-Number(numbers[it]);
    console.log(numbers[it+1] + " - " + numbers[it]);
    if (rest>1){
      for (let jt=0; jt<rest-1; jt++){
        console.log(Number(numbers[it]) + jt + 1)
        numbers.push(String(Number(numbers[it]) + jt + 1));
      }
    }
  }
  numbers.sort((a,b)=>a-b).map(x => `${Number(x)}`);
  return numbers.concat(strings)
}