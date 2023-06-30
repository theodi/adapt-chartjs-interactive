import ComponentModel from 'core/js/models/componentModel';

export default class ChartJSInteractiveModel extends ComponentModel {
  initialize(...args) {
    this.colorCounter = 0;
    this.getColor = this.getColor.bind(this);
    this.createHistogramData = this.createHistogramData.bind(this);
    this.createHistogramLabels = this.createHistogramLabels.bind(this);
    super.initialize(...args);
  }

  createLineChart(data, xAxis, yAxis) {
    const chartData = data.map(function(item) {
      return {
        x: item[xAxis],
        y: item[yAxis]
      };
    });

    const chartConfig = {
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

    let colorValues = data.map(function(item) {
      return item[colorField];
    });

    colorValues = this.removeUndefinedValues(colorValues);
    const uniqueColorValues = [...new Set(colorValues)];
    let scatterData = {};

    if (colorField === 'none') {
      scatterData = {
        datasets: [{
          label: xAxis + ', ' + yAxis,
          data: data.map(function(item) {
            return {
              x: item[xAxis],
              y: item[yAxis]
            };
          })
        }]
      };
    } else {
      const self = this;
      scatterData = {
        datasets: uniqueColorValues.map(function(value) {
          const filteredData = data.filter(function(item) {
            return item[colorField] === value;
          });

          return {
            data: filteredData.map(function(item) {
              return {
                x: item[xAxis],
                y: item[yAxis]
              };
            }),
            backgroundColor: self.getColor(),
            label: value.toString()
          };
        })
      };
    }

    const scatterOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: xAxis
          }
        },
        y: {
          title: {
            display: true,
            text: yAxis
          }
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    };

    const chartConfig = {
      type: 'scatter',
      data: scatterData,
      options: scatterOptions
    };

    return chartConfig;
  }

  removeUndefinedValues(array) {
    return array.filter(value => typeof value !== 'undefined');
  }

  createBoxPlot(data, xAxis, yAxis) {
    // Get the unique values for the yAxis
    const uniqueXAxisValues = this.removeUndefinedValues(Array.from(new Set(data.map(item => item[xAxis]))));

    // Prepare the datasets for the box plot
    const datasets = uniqueXAxisValues.map((xValue, index) => {
      const filteredData = data.filter(item => item[xAxis] === xValue);
      const values = filteredData.map(item => parseFloat(item[yAxis]));

      return {
        label: xValue,
        data: [values]
      };
    });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: yAxis
          }
        },
        x: {
          title: {
            display: true,
            text: xAxis
          }
        }
      },
      plugins: {
        colorschemes: {
          scheme: 'brewer.Paired12'
        }
      }
    };

    // Create the box plot chart
    const chartConfig = {
      data: {
        labels: [''],
        datasets
      },
      options: chartOptions
    };

    return chartConfig;
  }

  createHistogram(data, xAxis, binCount, splitField) {
    this.colorCounter = 0;
    let xValues = data.map(function(item) {
      return item[xAxis];
    });

    const splitValues = data.map(function(item) {
      return item[splitField];
    });

    let uniqueSplitValues = [...new Set(splitValues)];

    uniqueSplitValues = this.removeUndefinedValues(uniqueSplitValues);
    xValues = this.removeUndefinedValues(xValues);
    const min = Math.min(...xValues);
    const max = Math.max(...xValues);
    const self = this;

    const datasets = uniqueSplitValues.map(function(value) {
      const filteredData = data.filter(function(item) {
        return item[splitField] === value;
      });

      const histogramData = self.createHistogramData(filteredData.map(function(item) {
        return item[xAxis];
      }), binCount, min, max);

      return {
        label: value.toString(),
        data: histogramData,
        backgroundColor: self.getColor(),
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1
      };
    });

    const histogramOptions = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: xAxis
          }
        },
        y: {
          title: {
            display: true,
            text: 'Frequency'
          }
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    };

    const chartConfig = {
      type: 'bar',
      data: {
        labels: self.createHistogramLabels(binCount, min, max),
        datasets
      },
      options: histogramOptions
    };

    return chartConfig;

  }

  // Helper function to create histogram data
  createHistogramData(data, binCount, min, max) {
    const binSize = (max - min) / binCount;

    const histogramData = Array.from({ length: binCount }, function() {
      return 0;
    });

    data.forEach(function(value) {
      let binIndex = Math.floor((value - min) / binSize);
      if (binIndex === binCount) {
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
    const binSize = (max - min) / binCount;
    const labels = [];

    for (let i = 0; i < binCount; i++) {
      const label = `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`;
      labels.push(label);
    }

    return labels;
  }

  createHistogramAllData(data, xAxis, binCount) {
    const values = data.map(function(item) {
      const value = item[xAxis];
      return isNaN(value) ? null : value;
    }).filter(function(value) {
      return value !== null;
    });

    // Calculate logical boundaries for the bins
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const binWidth = (maxValue - minValue) / binCount;
    const bins = [];
    for (let i = 0; i <= binCount; i++) {
      bins.push(minValue + i * binWidth);
    }
    const counts = Array(binCount).fill(0);
    for (let i = 0; i < values.length; i++) {
      const value = parseFloat(values[i]);
      for (let j = 0; j < binCount; j++) {
        if (value >= bins[j] && value <= bins[j + 1]) {
          counts[j]++;
          break;
        }
      }
    }

    const chartData = {
      labels: bins.slice(0, -1).map(function(bin, index) {
        return bin.toFixed(2) + '-' + bins[index + 1].toFixed(2);
      }),
      datasets: [{
        label: 'Frequency',
        data: counts
      }]
    };

    const chartOptions = {
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
          display: false
        }
      }
    };
    const chartConfig = {
      type: 'bar',
      data: chartData,
      options: chartOptions
    };

    return chartConfig;
  }

  getColor() {
    const Paired12 = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
    const color = Paired12[this.colorCounter];
    this.colorCounter += 1;
    return color;
  }
}
