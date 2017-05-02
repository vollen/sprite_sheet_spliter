import PngImage from "pngjs-image";
import fs from "fs";

// async readF

function split(pathPng, pathJson) {
  PngImage.readImage(pathPng, (err, image)=>{
    if(err) throw err;

    try{
      const buffer = fs.readFileSync(pathJson);
      const object = JSON.parse(buffer);
    } catch(e){
    }
  });
}

split("input/test.png", "input/test.json");