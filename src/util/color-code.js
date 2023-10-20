export function colorGen(number, colorType) {		
    let characters = "0123456789ABCDEF";
    let colorArray = [];
    for(let i = 0; i < number; i++){
        let ANCode = '';
        for(let j = 0; j < 6; j++) {
            ANCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        let colorCode = '#'+ANCode;
        let generatedColor = '';
        switch (colorType) {
            case 'rgb':
                let arr = hexToRgb(colorCode); 
                colorCode = 'rgb('+arr[0]+','+arr[1]+','+arr[2]+')';
                color = colorCode;
            break;
            case 'rgba':
                generatedColor = hexToRgbA(colorCode);
                colorArray.push(generatedColor);
            break;
        
            default:
                colorCode = '#'+ANCode;
                color = colorCode;
            break;
        }
        
    }
    return colorArray;
}

const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));

function hexToRgbA(hex){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}