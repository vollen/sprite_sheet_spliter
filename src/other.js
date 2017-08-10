import IParser from "./IParser";
import PngImage from "pngjs-image";

const JSON_EXT = ".txt";
function getPolicy(filename){
  return IParser.getPolicy(filename, JSON_EXT);
}

function split(image, configBuffer) {
  // const config = JSON.parse(configBuffer);
  // const infos = getImagesInfo(config);
  // const resList = config.res || {};
  // const images = {};
  // for(let k in resList){
  //   const {x, y, w, h, } = resList[k];
  //   const {width, height, offsetX, offsetY} = infos[k];

  //   var newImage = PngImage.createImage(width, height);
  //   newImage.fillRect(0, 0, width, height, {red:0, green:0, blue:0, alpha:0})
  //   image.getImage().bitblt(newImage.getImage(), x, y, w, h,offsetX, offsetY);
  //   images[k] = newImage;
  // }
  // return images;
  const values = configBuffer.split(",");
  const  count = +values[1];

  let index = 2;
  const images = {};
  let x = 0, y = 0;
  let maxW = 0, maxH = 0;
  let minW = 0, minH = 0;
  for(let i = 0; i < count; i++){
    const ox = +values[index++];
    const oy = +values[index++];
    const w = +values[index++];
    const h = +values[index++];

    minW = checkValue(minW, -ox, Math.min);
    minH = checkValue(minH, -oy, Math.min);
    maxW = checkValue(maxW, -ox + w, Math.max);
    maxH = checkValue(maxH, -oy + h, Math.max);
    console.log(i, ox, oy, w, h);
    console.log(minW, minH, maxW, maxH);
  }

  index = 2;
  let width = 0, height = 0;
  for(let i = 0; i < count; i++){
    const ox = +values[index++];
    const oy = +values[index++];
    const w = +values[index++];
    const h = +values[index++];
    console.log(i, ox, oy, w, h);
    console.log(width, -ox - minW + w);
    width = checkValue(width, -ox - minW + w, Math.max);
    height = checkValue(height, -oy - minH + h, Math.max);
  }

  console.log(width, height);
  index = 2;
  for(let i = 0; i < count; i++){
    const ox = +values[index++];
    const oy = +values[index++];
    const w = +values[index++];
    const h = +values[index++];

    console.log(i, x, y, w, h);

    // const width = maxW - minW;
    // const height = maxH - minH;
    var newImage = PngImage.createImage(width, height);
    console.log(x, y, w, h, ox, oy, width, height);
    newImage.fillRect(0, 0, width, height, {red:0, green:0, blue:0, alpha:0})
    image.getImage().bitblt(newImage.getImage(), x, y, w, h, -ox - minW, -oy - minH);
    images[i] = newImage;
    x = x + w;
  }

141,28,288,51,
141,31,288,54
  return images;
}

function checkValue(originV, newV, func){
  return originV ? func(originV, newV) : newV;
}

function getImagesInfo(config){
  const actions = config.mc;
  const frames = config.res;
  let t_top = Number.MAX_VALUE;
  let t_left = Number.MAX_VALUE;
  let t_bottom = Number.MIN_VALUE;
  let t_right = Number.MIN_VALUE;
  const tmps = {};
  for(let k in actions){
    const action = actions[k];
    action.frames.forEach(frame=>{
      const {x, y, res} = frame;
      const data = frames[res];
      const left = x;
      const top = y;
      const right = left + data.w;
      const bottom = right + data.h;

      let tmp = tmps[res];
      if(!tmp){
        tmps[res] = tmp = {};
      }
      tmp.left = checkValue(tmp.left, left, Math.min);
      tmp.right = checkValue(tmp.right, right, Math.max);
      tmp.top = checkValue(tmp.top, top, Math.min);
      tmp.bottom = checkValue(tmp.bottom, bottom, Math.max);

      t_left = checkValue(t_left, tmp.left, Math.min);
      t_top = checkValue(t_top, tmp.top, Math.min);
      t_bottom = checkValue(t_bottom, tmp.bottom, Math.max);
      t_right = checkValue(t_right, tmp.right, Math.max);
    });
  }

  const width = t_right - t_left;
  const height = t_bottom - t_top;
  const infos = {};
  for (let k in tmps){
    const data = tmps[k];
    const info = {};
    infos[k] = info;
    info.width = width;
    info.height = height;
    info.offsetX = data.left - t_left;
    info.offsetY = data.top - t_top;
  }

  return infos;
}

module.exports = {
	getPolicy: getPolicy,
	split : split,
	POLICY : IParser.POLICY,
}