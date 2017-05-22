import IParser from "./IParser";
import PngImage from "pngjs-image";
import plist from "plist";
import gm from "gm";

const PLIST_EXT = ".plist";
function getPolicy(filename){
  return IParser.getPolicy(filename, PLIST_EXT);
}

function split(image, configBuffer) {
  const config = plist.parse(configBuffer);
  const format = config.metadata ? config.metadata.format : 0;
  const frames = config.frames;
  if (format == 2){
      for(let k in frames){
        const data = frames[k];
        const [x, y, w, h] = getConfigValues(data.frame);
        const rotate = data.rotated;
        const [ox, oy] = getConfigValues(data.offset);
        const [sw, sh] = getConfigValues(data.sourceSize);

        const newImage = PngImage.createImage(sw, sh);

      }
  }

  const resList = config.res || {};
  const images = {};
  for(let k in resList){
    const {x, y, w, h, } = resList[k];
    const {width, height, offsetX, offsetY} = infos[k];

    var newImage = PngImage.createImage(width, height);
    newImage.fillRect(0, 0, width, height, {red:0, green:0, blue:0, alpha:0})
    image.getImage().bitblt(newImage.getImage(), x, y, w, h,offsetX, offsetY);
    images[k] = newImage;
  }
  return images;
}

function getConfigValues(str){
    return str.match(/\d/g);
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