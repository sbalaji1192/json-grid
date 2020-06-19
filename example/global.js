function jsonP(data) {
  var container = document.getElementById("container");
  var jsonGrid = new JSONGrid({
    data
  });
  
  jsonGrid.render(container);
}