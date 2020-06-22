function jsonP(data) {
  var container = document.getElementById("container");
  var jsonGrid = new JSONGrid({
    data,
    performanceBoost: true
  });
  
  console.log("loaded");
  console.time("Test");
  jsonGrid.render(container);
  console.timeEnd("Test");
}