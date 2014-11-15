function f() {
  var ta1 = $('#ta1').val()
  var ta2 = $('#ta2').val()
  var chart= d3.select('.chart')
  var data= [ta1, ta2]
  chart.selectAll('div')
  .data(data)
  .enter()
  .append('div')
  .style("width", function(d) { return d*10 + "px" })
  .text(function (d) {return d})
}