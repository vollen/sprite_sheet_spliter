import PngImage from "pngjs-image";
import fs from "fs-extra-promise";
import path from "path";
import promise from "bluebird";

const POLICY = {
	IGNORE:"ignore",
	COPY:"copy",
	PNG:"png",
}

const PNG_EXT = ".png";
function getPolicy(filename, configExt){
  const extName = path.extname(filename);
  if(extName == configExt){
    const pngName = replaceExt(filename, configExt, PNG_EXT);
    return fs.existsAsync(pngName)
        .then((result)=>{
          if(result){
              return{policy: POLICY.PNG, data:{png:pngName, config:filename}};
          } else {
              return{policy: POLICY.COPY};
          }
        });
  } else if(extName == PNG_EXT){
    const jsonName = replaceExt(filename, PNG_EXT, configExt);
    return fs.existsAsync(jsonName)
        .then((result)=>{
          if(result){
              return {policy:POLICY.IGNORE};
          } else {
              return{policy: POLICY.COPY};
          }
        });
  } else {
    return promise.resolve({policy: POLICY.COPY});
  }
}

function replaceExt(filename, originExt, newExt){
  const reg = new RegExp(originExt + "$");
  return filename.replace(reg, newExt);
}

function split (pngImage, configBuffer) {
}

module.exports = {
	getPolicy: getPolicy,
	split : split,
	POLICY : POLICY,
}