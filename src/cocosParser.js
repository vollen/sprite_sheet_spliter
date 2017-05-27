import IParser from "./IParser";
import PngImage from "pngjs-image";
import plist from "plist";
import gm from "gm";
import path from "path";

const PLIST_EXT = ".plist";
function getPolicy(filename){
  return IParser.getPolicy(filename, PLIST_EXT);
}

function split(image, configBuffer) {
  const config = plist.parse(configBuffer);
  const format = config.metadata ? config.metadata.format : 0;
  const frames = config.frames;
  const images = {};
  if (format == 2){
      for(let k in frames){
        const data = frames[k];
        let [x, y, w, h] = getConfigValues(data.frame);
        const rotate = data.rotated;
        const [ox, oy] = getConfigValues(data.offset);
        const [sw, sh] = getConfigValues(data.sourceSize);

        if (rotate){
          const tmp = w;
          w = h;
          h = tmp;
        }
        const newImage = PngImage.createImage(sw, sh);
        newImage.fillRect(0, 0, sw, sh, {red:0, green:0, blue:0, alpha:0})
        image.getImage().bitblt(newImage.getImage(), x, y, w, h, 0, 0);
        images[path.basename(k)] = newImage;
      }
  }
  return images;
}

function getConfigValues(str){
    return str.match(/-?\d+/g).map(a=>{return +a;});
}

module.exports = {
	getPolicy: getPolicy,
	split : split,
	POLICY : IParser.POLICY,
}