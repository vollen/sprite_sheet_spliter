import PngImage from "pngjs-image";
import fs from "fs-extra-promise";
import promise from "bluebird";
import node_png from "node-png";

// const saveImage = promise.promisify(PngImage.writeImage);

// async readF
function split(image, config, path) {
  console.log(image);
  const resList = config.res || {};
  for(let k in resList){
    const {x, y, w, h} = resList[k];
    var newImage = PngImage.createImage(w, h);
    image.getImage().bitblt(newImage.getImage(), x, y, w, h, 0, 0);
    // promisList.push(saveImage().call(image, path + k + ".png"));
    console.log("--getFile-", path + k, x, y, w, h);
    newImage.writeImage(path + k + ".png", function(err){
      if (err){
        console.log("save file failed" + err);
      } else {
        console.log("save file successed", path + k + ".png");
      }
    });
  }
  // promise.all(promisList).then(()=>{
  //   console.log("split file" + path + "successed");
  // }).catch(err=>{
  //   console.log("save file failed" + err);
  // })
}

function dealFile(pngFile, jsonFile, path) {
  const fileName = pngFile.slice(0, -4);
  promise.all([
    // readImage(pngFile),
    fs.readFileAsync(pngFile),
    fs.readFileAsync(jsonFile)
  ]).then((values)=>{
    const [image, jsonBuffer] = values;
    const config = JSON.parse(jsonBuffer);
    splitAndSave(PngImage.loadImageSync(image), config, path + fileName + "/");
  }).catch((err)=>{
    console.log(err);
  })
}

function splitAndSave(image, jsonData, path){
  fs.existsAsync(path)
    .then((result)=>{
      if(result){
            split(image, jsonData, path);
      } else {
        fs.mkdirpAsync(path)
          .then((err)=>{
            if(err){
              console.log(err);
              return;
            }
            split(image, jsonData, path);
          })
      }
    });
}

function explorer(path) {
    fs.readdirAsync(path)
      .then(files=>{
        var len = files.length;
        for (var i = 0; i < len; i++) {
            var fileName = files[i];
            const fullName = path + "/" + fileName;
            const name = fileName.slice(0, -4);
            if(fileName.slice(-4) == ".png"){
              const jsonName =  path +"/"+ name + ".json";
              fs.existsAsync(jsonName)
                .then((result)=>{
                  if (result){
                    console.log("---deal---file--", jsonName);
                    dealFile(fullName, jsonName, "output");
                  }
                })
            } else{
              fs.isDirectoryAsync(fullName)
                .then((result)=>{
                  // console.log(fullName, result);
                  if (result){
                      explorer(fullName);
                  }
                })
                .catch(()=>{
                });
            }
        }
      })
      .catch(err=>{
          console.log('error:\n', err);
      })
}

// explorer("/home/leng/test/ssss/res/slth.triumbest.net/egret/resource/assets/model/fabao/")
explorer("/home/leng/test/ssss");