import xml2json from "xml2json";
import fs from "fs-extra-promise";
import plist from "plist"


function test(filename){
	fs.readFileAsync(filename, "utf8")
		.then((data)=>{
			console.log(data);
			const json = xml2json.toJson(data, {object:false});
			console.log(json);
		})
}

function testPlist (filename) {
	fs.readFileAsync(filename, "utf8")
		.then((data)=>{
			const json = plist.parse(data);
			console.log(json);
		})
}

// test("./input/attack1.plist");
testPlist("./input/attack1.plist");