import Adapt from 'core/js/adapt';
import ComponentModel from 'core/js/models/componentModel';
//import { getColor } from 'libraries/colorUtils'; // Import the getColor function

export default class ChartJSInteractiveModel extends ComponentModel {
  initialize(...args) {
    this.colorCounter = 0;
    this.getColor = this.getColor.bind(this);
    this.createHistogramData = this.createHistogramData.bind(this);
    this.createHistogramLabels = this.createHistogramLabels.bind(this);
    super.initialize(...args);
  }
  createLineChart(data, xAxis, yAxis) {
    var chartData = data.map(function(item) {
      return {
        x: item[xAxis],
        y: item[yAxis]
      };
    });

    var chartConfig = {
      type: 'line',
      data: {
        datasets: [{
          label: yAxis,
          data: chartData
        }]
      },
      options: {
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: xAxis
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: yAxis
            }
          }
        },
        plugins: {
          colorschemes: {
            scheme: 'brewer.Paired12'
          },
          legend: {
            display: false
          }
        }
      }
    };

    return chartConfig;
  }   

  createScatterPlot(data, xAxis, yAxis, colorField) {
    this.colorCounter = 0;
    var xValues = data.map(function(item) {
      return item[xAxis];
    });

    var yValues = data.map(function(item) {
      return item[yAxis];
    });
    
    var colorValues = data.map(function(item) {
      return item[colorField];
    });

    colorValues = this.removeUndefinedValues(colorValues);
    var uniqueColorValues = [...new Set(colorValues)];

    if (colorField == "none") {
      var scatterData = {
        datasets: [{
          label: xAxis + ", " + yAxis,
          data: data.map(function(item) {
            return {
              x: item[xAxis],
              y: item[yAxis]
            };
          })
        }]
      };
    } else {
      var self = this;
      var scatterData = {
        datasets: uniqueColorValues.map(function(value) {
          var filteredData = data.filter(function(item) {
            return item[colorField] === value;
          });

          return {
            data: filteredData.map(function(item) {
              return {
                x: item[xAxis],
                y: item[yAxis],
              };
            }),
            backgroundColor: self.getColor(),
            label: value.toString(),
          };
        }),
      };
    }

    var scatterOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: xAxis,
          },
        },
        y: {
          title: {
            display: true,
            text: yAxis,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    };

    var chartConfig = {
      type: 'scatter',
      data: scatterData,
      options: scatterOptions,
    };

    return chartConfig;
  }

  removeUndefinedValues(array) {
   return array.filter(value => typeof value !== 'undefined');
  }

  createBoxPlot(data, xAxis, yAxis) {
    // Get the unique values for the yAxis
    var uniqueXAxisValues = this.removeUndefinedValues(Array.from(new Set(data.map(item => item[xAxis]))));

    // Prepare the datasets for the box plot
    var datasets = uniqueXAxisValues.map((xValue, index) => {
      var filteredData = data.filter(item => item[xAxis] === xValue);
      var values = filteredData.map(item => parseFloat(item[yAxis]));

      return {
        label: xValue,
        data: [values],
      };
    });

    var chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: yAxis,
          },
        },
        x: {
          title: {
            display: true,
            text: xAxis,
          },
        },
      },
      plugins: {
        colorschemes: {
          scheme: 'brewer.Paired12'
        },
      },
    };

    // Create the box plot chart
    var chartConfig = {
      data: {
        labels: [""],
        datasets: datasets,
      },
      options: chartOptions,
    };

    return chartConfig;
  }

  createHistogram(data, xAxis, binCount, splitField) {
    this.colorCounter = 0;
    var xValues = data.map(function(item) {
      return item[xAxis];
    });

    var splitValues = data.map(function(item) {
      return item[splitField];
    });

    var uniqueSplitValues = [...new Set(splitValues)];

    uniqueSplitValues = this.removeUndefinedValues(uniqueSplitValues);
    xValues = this.removeUndefinedValues(xValues);
    var min = Math.min(...xValues);
    var max = Math.max(...xValues);
    var self = this;

    var datasets = uniqueSplitValues.map(function(value) {
      var filteredData = data.filter(function(item) {
        return item[splitField] === value;
      });

      var histogramData = self.createHistogramData(filteredData.map(function(item) {
        return item[xAxis];
      }), binCount, min, max);

      return {
        label: value.toString(),
        data: histogramData,
        backgroundColor: self.getColor(),
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
      };
    });
    
    var histogramOptions = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: xAxis,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Frequency',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    };

    var chartConfig = {
      type: 'bar',
      data: {
        labels: self.createHistogramLabels(binCount, min, max),
        datasets: datasets,
      },
      options: histogramOptions,
    };

    return chartConfig;

  }

  // Helper function to create histogram data
  createHistogramData(data, binCount,min,max) {
    var binSize = (max - min) / binCount;

    var histogramData = Array.from({ length: binCount }, function() {
      return 0;
    });

    data.forEach(function(value) {
      var binIndex = Math.floor((value - min) / binSize);
      if (binIndex == binCount) {
        binIndex = binIndex - 1;
      }
      if (binIndex >= 0 && binIndex < binCount) {
        histogramData[binIndex]++;
      }
    });

    return histogramData;
  }

  // Helper function to create histogram labels
  createHistogramLabels(binCount, min, max) {
    var binSize = (max - min) / binCount;
    var labels = [];

    for (var i = 0; i < binCount; i++) {
      var label = `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`;
      labels.push(label);
    }

    return labels;
  }
  
  createHistogramAllData(data, xAxis, binCount) {
    var values = data.map(function(item) {
      var value = item[xAxis];
      return isNaN(value) ? null : value;
    }).filter(function(value) {
      return value !== null;
    });

    // Calculate logical boundaries for the bins
    var minValue = Math.min(...values);
    var maxValue = Math.max(...values);

    var binWidth = (maxValue - minValue) / binCount;
    var bins = [];
    for (var i = 0; i <= binCount; i++) {
      bins.push(minValue + i * binWidth);
    }
    var counts = Array(binCount).fill(0);
    for (var i = 0; i < values.length; i++) {
      var value = parseFloat(values[i]);
      for (var j = 0; j < binCount; j++) {
        if (value >= bins[j] && value <= bins[j + 1]) {
          counts[j]++;
          break;
        }
      }
    }

    var chartData = {
      labels: bins.slice(0, -1).map(function(bin, index) {
        return bin.toFixed(2) + '-' + bins[index + 1].toFixed(2);
      }),
      datasets: [{
        label: 'Frequency',
        data: counts
      }]
    };

    var chartOptions = {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Bins'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Frequency'
          }
        }
      },
      plugins: {
        colorschemes: {
          scheme: 'brewer.Paired12'
        },
        legend: {
          display: false,
        }
      }
    };
    var chartConfig = {
      type: 'bar',
      data: chartData,
      options: chartOptions
    };

    return chartConfig;
  }

  getColor() {
    var Tableau20 = ['#4E79A7', '#A0CBE8', '#F28E2B', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
    var Paired12 = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
    var color = Paired12[this.colorCounter]; 
    this.colorCounter += 1;
    return color; 
  }
}