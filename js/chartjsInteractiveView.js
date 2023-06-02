import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';
import Chart from 'libraries/chart'
//import { BoxPlotController, BoxAndWiskers } from 'libraries/chartjs-chart-boxplot';
    
export default class ChartJSInteractiveView extends ComponentView {

  preRender() {
      var dataSource = this.model.get('dataSource');
      console.log(JSON.stringify(this.model.get('availableChartTypes')));
      if (dataSource) {
        fetch(dataSource)
          .then(response => response.text())
          .then(csvData => {
            this.chartData = this.parseCSVData(csvData);
            this.populateAxisSelections()
            this.renderChart();
          })
          .catch(error => {
            console.error('Error loading chart data:', error);
          });
      } else {
          console.error('Error loading chart data:', error);
      }
  }
  populateAxisSelections() {

    // Populate the xAxisSelector and yAxisSelector options
    const xAxisSelector = this.$("#xAxis");
    const yAxisSelector = this.$("#yAxis");
    const pointColorSelector = this.$("#pointColor");

    var chartType = this.model.get("defaultChartType") || "line";
    var xAxis = this.model.get("defaultXAxis");
    var yAxis = this.model.get("defaultYAxis");
    var pointColor = this.model.get("defaultColorSelector") || "none";

    // Clear any existing options
    xAxisSelector.empty();
    yAxisSelector.empty();
    pointColorSelector.empty();

    var data = this.chartData;
    // Populate options based on data fields
    const option = `<option value="none">none</option>`;
    pointColorSelector.append(option);
    if (data && Array.isArray(data)) {
      const fields = Object.keys(data[0]);

      // Add fields as options
      fields.forEach((field) => {
        const xAxisOption = `<option value="${field}"${xAxis === field ? ' selected' : ''}>${field}</option>`;
        const yAxisOption = `<option value="${field}"${yAxis === field ? ' selected' : ''}>${field}</option>`;
        const pointColorOption = `<option value="${field}"${pointColor === field ? ' selected' : ''}>${field}</option>`;

        xAxisSelector.append(xAxisOption);
        yAxisSelector.append(yAxisOption);
        pointColorSelector.append(pointColorOption);

        if (xAxis === undefined || !xAxis || xAxis === "") {
          xAxis = field;
        }
        if (yAxis === undefined || !yAxis || yAxis === "") {
          yAxis = field;
        }
      });
    }
    this.model.set('chartType', chartType);
    this.model.set('xAxis', xAxis);
    this.model.set('yAxis', yAxis);
    this.model.set('pointColor', pointColor);
    this.model.set('binCount', 5);
  }

  postRender() {
    this.chartTypeButtons = this.$('.chart-type-selector .chart-button');
    this.chartTypeButtons.on('click', this.onChartTypeButtonClick.bind(this));
    this.chartAxisSelectors = this.$('.axis-selector select');
    this.chartAxisSelectors.on('change', this.onAxisChange.bind(this));
    this.chartBinSelector = this.$('.bin-selector input');
    this.chartBinSelector.on('change', this.onAxisChange.bind(this));
  }

  onChartTypeButtonClick(event) {
    const selectedChartType = event.currentTarget.dataset.chartType;
    this.changeChartType(selectedChartType);
  }

  onAxisChange(event) {
    this.changeChartType(this.model.get('chartType'));
  }

  renderChart() {
      var chartConfig;
      var xAxis = this.model.get('xAxis');
      var yAxis = this.model.get('yAxis');
      var pointColor = this.model.get('pointColor');
      var binCount = this.model.get('binCount');
      var chartType = this.model.get('chartType');

      if (chartType == "histogram") {
        this.$('#binCountSelector').css("display","inline-block");
        this.$('#pointColorSelector').css("display","inline-block");
        this.$('#yAxisSelector').css("display","none");  
      } else {
        this.$('#binCountSelector').css("display","none");
        this.$('#pointColorSelector').css("display","none");
        this.$('#yAxisSelector').css("display","inline-block");
      }
      if (chartType == "scatter") {
        this.$('#pointColorSelector').css("display","inline-block");
      }
      if (chartType != "histogram" && chartType != "scatter") {
        this.$('#pointColorSelector').css("display","none"); 
      }

      if (chartType === 'line') {
        chartConfig = this.model.createLineChart(this.chartData, xAxis, yAxis);
      } else if (chartType === 'scatter') {
        chartConfig = this.model.createScatterPlot(this.chartData, xAxis, yAxis, pointColor);
      } else if (chartType === 'boxplot') {
        chartConfig = this.model.createBoxPlot(this.chartData, xAxis, yAxis, pointColor);
      } else if (chartType === 'histogram' && pointColor != "none") {
        chartConfig = this.model.createHistogram(this.chartData, xAxis, binCount, pointColor);
      } else if (chartType === 'histogram' && pointColor == "none") {
        chartConfig = this.model.createHistogramAllData(this.chartData, xAxis, binCount);
      }
      console.log(JSON.stringify(chartConfig));

      var canvasId = `myChart${this.model.get('_id')}`;
      var canvasElement = this.$(`#${canvasId}`)[0];
      var context = canvasElement.getContext('2d');

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(context, chartConfig);
      this.setReadyStatus();
  }
  
  changeChartType(chartType) {
    // Update the model's chart type

    var xAxis = this.$('#xAxis').val();
    var yAxis = this.$('#yAxis').val();
    var pointColor = this.$('#pointColor').val();
    var binCount = parseInt(this.$('#binCount').val());

    this.model.set('chartType', chartType);
    this.model.set('xAxis', xAxis);
    this.model.set('yAxis', yAxis);
    this.model.set('pointColor', pointColor);
    this.model.set('binCount', binCount);

    // Render the new chart
    this.renderChart();
  }

  parseCSVData(csvData) {
    // Parse the CSV data into an array of objects
    var lines = csvData.trim().split('\n');
    var headers = lines[0].split(',');
    var result = [];
  
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].split(',');
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j].trim()] = line[j].trim();
      }

      result.push(item);
    }

    return result;
  }

  // Other methods for handling user interactions and view-specific logic
}