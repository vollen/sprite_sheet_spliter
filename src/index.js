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
      const fullName = input + "/" + fileName;
      const tmpOutput = path.join(output, fileName)
      if (path.extname(fileName) == ".png") {
        doWithPng(fullName, tmpOutput);
      } else {
        doWithOther(fullName, tmpOutput);
      }
    })
    .catch(err => {
      console.log('error:\n', err);
    })
}

function doWithPng(fullName, output) {
  const configFile = parser.getConfigFile(fullName);
  fs.existsAsync(configFile)
    .then((result) => {
      if (result) {
        output = output.slice(0, -4)
        dealSpriteSheet(fullName, configFile, output);
      } else {
        fs.copy(fullName, output);
      }
    });
}

function doWithOther(fullName, output) {
  fs.isDirectoryAsync(fullName)
    .then((result) => {
      if (result) {
        explorer(fullName, output);
      } else {
        fs.copy(fullName, output);
      }
    });
}

function dealSpriteSheet(pngFile, configFile, output) {
  return promise.all([
    loadPng(pngFile),
    fs.readFileAsync(configFile),
    fs.mkdirpAsync(output)
  ]).then((values) => {
    const [image, configBuffer] = values;
    const images = parser.split(image, configBuffer);
    return promise.resolve(images);
  })
    .then((images) => {
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
  input : "/Users/leng/self/tools/sprite_sheet_spliter/input",
  // input: "/home/leng/test/ssss/res/slth.triumbest.net/egret/resource/assets/model/fabao/",
  output: "output/",
  parser: "./egretParser",
}

const parser = require(config.parser);
explorer(config.input, config.output);
// explorer("input/");