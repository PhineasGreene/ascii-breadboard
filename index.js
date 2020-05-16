/*always*/ "use strict";

//packages
const fs = require("fs");
const prompt = require('prompt-sync')({sigint: true});

//load patterns json
const raw = fs.readFileSync('patterns.json');
var patterns = JSON.parse(raw).patterns;

//populate patterns with rotated duplicates unless marked as directional
function rotate(a, j){
    var newArr = [[], [], []];
    
    if(j <= 0) return a;
    
    newArr[0][0] = a[2][0];
    newArr[0][1] = a[1][0];
    newArr[0][2] = a[0][0];
    newArr[1][2] = a[0][1]; 
    newArr[2][2] = a[0][2];
    newArr[2][1] = a[1][2];
    newArr[2][0] = a[2][2];
    newArr[1][0] = a[2][1];
    newArr[1][1] = a[1][1];
    
    return rotate(newArr, j - 1);
};

var l = patterns.length;

for(let i = 0; i < l; i++){
    let p = patterns[i];
    //if non directional
    if(!p.directional){
        for(let j = 1; j <= 3; j++){ 
            patterns.push({
                a:rotate(p.a, j),
                b:rotate(p.b, j)
            });
        }
    }
}


//some utilities for working on the grid of text
function read(x, y, arr){
	return x >= 0 && y >= 0 && y < arr.length && x < arr[y].length ? arr[y][x] : " ";
};

function write(x, y, arr, val){
	var newArr = JSON.parse(JSON.stringify(arr));
	if(x >= 0 && y >= 0 && y < arr.length && x < arr[y].length){
        newArr[y][x] = val;
    }
	return newArr;
};

function print(arr){
    for(var i = 0; i < arr.length; i++){
        let str = "";
        for(var j = 0; j < arr[i].length; j++){
            str += arr[i][j];
        }
        console.log(str);
    }
};

function step(arr){
    var newArr = JSON.parse(JSON.stringify(arr));
    var oldArr = arr;
    
    for(var y = 0; y < oldArr.length; y++){
        for(var x = 0; x < oldArr[y].length; x++){
            for(var i = 0; i < patterns.length; i++){
                let find    = patterns[i]["a"];
                let replace = patterns[i]["b"];
                
                if(read(x-1, y-1, oldArr) != find[0][0]) continue;
                if(read(x, y-1, oldArr) != find[0][1]) continue;
                if(read(x+1, y-1, oldArr) != find[0][2]) continue;
                if(read(x-1, y, oldArr) != find[1][0]) continue;
                if(read(x, y, oldArr) != find[1][1]) continue;
                if(read(x+1, y, oldArr) != find[1][2]) continue;
                if(read(x-1, y+1, oldArr) != find[2][0]) continue;
                if(read(x, y+1, oldArr) != find[2][1]) continue;
                if(read(x+1, y+1, oldArr) != find[2][2]) continue;
                
                newArr = write(x-1, y-1, newArr, replace[0][0]);
                newArr = write(x, y-1, newArr, replace[0][1]);
                newArr = write(x+1, y-1, newArr, replace[0][2]);
                newArr = write(x-1, y, newArr, replace[1][0]);
                newArr = write(x, y, newArr, replace[1][1]);
                newArr = write(x+1, y, newArr, replace[1][2]);
                newArr = write(x-1, y+1, newArr, replace[2][0]);
                newArr = write(x, y+1, newArr, replace[2][1]);
                newArr = write(x+1, y+1, newArr, replace[2][2]);
                break;
            }
        }
    }
    
    return newArr;
};

//load the starting grid from ./test.txt
var origin=fs.readFileSync('test.txt');
origin = origin.toString();
origin = origin.split("\n");
origin = origin.map(function(x){
    return x.replace('\r', '').split("");
});

//run the program. this will change when all patterns are added.
var next = origin;
while(true){
    print(next);
    next = step(next);
    prompt();
}