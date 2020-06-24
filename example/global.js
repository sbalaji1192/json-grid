let uberData;
function jsonP(data, expand) {
  var container = document.getElementById("container");
  $(container).empty();
  JSONGrid.prototype.instances = 0;
  var jsonGrid = new JSONGrid({
    data,
    expand
  });
  
  uberData || (uberData = data);
  console.time("Load Time");
  jsonGrid.render(container);
  console.timeEnd("Load Time");

  document.querySelector("input.row").onkeyup = function(e) {
  	let data = JSON.parse(JSON.stringify(uberData));
	searchByRows(data, e.target.value);
	jsonP(data, !!e.target.value);
	};

	document.querySelector("input.column").onkeyup = function(e) {
  	let data = JSON.parse(JSON.stringify(uberData));
	searchByColumns(data, e.target.value);
	jsonP(data, !!e.target.value);
	};

	document.querySelector("button").onclick = function(e) {
		let data = JSON.parse(document.querySelector("textarea").value);
		jsonP(data, !!e.target.value);
	}
}


function searchByColumns(data, key) {
	if (Array.isArray(data)) {
		for(let i = 0 ; i < data.length; i++) {
			if (!searchByColumns(data[i], key)) {
				data.splice(i, 1);
				--i;
			}
		}

		return !!data.length
	}
	else if (typeof data == 'object') {
		for (let i in data) {
			if (i.toLowerCase().indexOf(key.toLowerCase()) == -1 && !searchByColumns(data[i], key)) {
				delete data[i];
			}
		}
			
		return !!Object.keys(data).length;
	}
	else {
		return false;
	}
}

function searchByRows(data, key) {
	if (Array.isArray(data)) {
		for(let i = 0 ; i < data.length; i++) {
			if (!searchByRows(data[i], key)) {
				data.splice(i, 1);
				--i;
			}
		}

		return !!data.length
	}
	else if (typeof data == 'object') {
		for (let i in data) {
			if (!searchByRows(data[i], key)) {
				delete data[i];
			}
		}
		return !!Object.keys(data).length;
	}
	else {
		if (data == undefined || data == null) {
			data = '';
		}
		else {
			data = data.toString();
		}
		return data.toLowerCase().indexOf(key.toLowerCase()) > -1;
	}
}

















