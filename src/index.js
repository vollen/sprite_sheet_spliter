import PngImage from "pngjs-image";
import fs from "fs-extra-promise";
import promise from "bluebird";
import path from "path";

// const saveImage = promise.promisify(PngImage.writeImage);

const loadImage = promise.promisify(PngImage.loadImage);
function loadPng(filename) {
  return fs.readFileAsync(filename)
    .then((data) => {
      return loadImage(data);
    })
}

function writeImage(image, path) {
  return new Promise((resolve, reject) => {
    image.writeImage(path, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function explorer(input, output) {
  input = path.resolve(input);
  output = path.resolve(output);
  fs.readdirAsync(input)
    .map(function (fileName) {
      const tmpOutput = path.join(output, fileName)
      return fs.existsAsync(fileName)
      .then(result=>{
        const fullName = path.join(input, fileName);
        if (result) {
          explorer(fullName, tmpOutput);
        } else {
          dealFile(fullName, tmpOutput);
        }
      })
    })
    .catch(err => {
      console.log('error:\n', err);
    })
}

function dealFile(fileName, output){
  parser.getPolicy(fileName)
    .then(result=>{
      const {policy, data} = result;
      if(policy == parser.POLICY.COPY){
        fs.copy(fileName, output);
      } else if (policy == parser.POLICY.PNG){
        output = output + "_" + parser.POLICY.PNG;
        const {png, config} = data;
        dealSpriteSheet(png, config, output);
      }
    })
}

function dealSpriteSheet(pngFile, configFile, output) {
  return promise.all([
    loadPng(pngFile),
    fs.readFileAsync(configFile, "utf8"),
    fs.mkdirpAsync(output)
  ]).then((values) => {
    const [image, configBuffer] = values;
    const images = parser.split(image, configBuffer);
    return promise.resolve(images);
  }).then((images) => {
    const promises = [];
    for (let k in images) {
      const newImage = images[k];
      promises.push(writeImage(newImage, path.join(output, k + ".png")));
    }
    return Promise.all(promises);
  }).catch((err) => {
    console.log(err);
  })
}


const config = {
  // input : "/home/leng/test/ssss",
  input: "input/aa",
  output: "output/aa",
  // parser: "./egretParser",
  parser: "./other",
}

const parser = require(config.parser);
explorer(config.input, config.output);