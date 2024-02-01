	import { randomElement } from "./utils.js";
	
	let words1;
	let words2;
	let words3;

	//load arrays of babble in from babble-data.json
	const loadBabble = () => {
		const url = "data/babble-data.json";
		const xhr = new XMLHttpRequest();

		xhr.onload = (e) => babbleLoaded(e);
		xhr.onerror = (e) => console.log(`In onerror - HTTP Status Code = ${e.target.status}`);
		xhr.open("GET", url);
		xhr.send();
	}

	//generate given number of lines of babble
	const generate = (num) => {
		let html = "";

		for (let i = 0; i < num; i++) {
			html += `<p>${randomElement(words1)} ${randomElement(words2)} ${randomElement(words3)}</p>`;
		}

		document.querySelector("#output").innerHTML = html;
	}

	//parse babble data from json file
	const babbleLoaded = (e) => {
		let json;
		console.log(`In onload - HTTP Status Code = ${e.target.status}`);

		//check to make sure json file formatted correctly
		try {
			json = JSON.parse(e.target.responseText);
		} catch {
			document.querySelector("#output").innerHTML = "JSON file error";
			return;
		}

		json = JSON.parse(e.target.responseText);
		words1 = json["words1"];
		words2 = json["words2"];
		words3 = json["words3"];

		document.querySelector("#btn-gen-1").onclick = () => generate(1);
		document.querySelector("#btn-gen-5").onclick = () => generate(5);
		generate(1);
	}

	loadBabble();
