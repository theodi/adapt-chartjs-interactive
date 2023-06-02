# adapt-chartjs-interactive

This is a container for displaying [Chart.js](http://www.chartjs.org/) charts in the Adapt framework and authoring tool. This plugin has a number of selectable charts that you can specify by default and it also allows the user to interact with the charts, selecting different charts as well as dimensions from the data for the X and Y axis as well as color of points or bars. 

![Screenshot](examples/screenshot.jpg)

### Installation

Can be installed into the authoring tool or stand-alone.

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**_component** (string): This value must be: `chartjsInteractive`.

**_classes** (string): CSS class name to be applied to **Chart**’s containing div. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left`, or `right`.

**title** (string): The title of the chart component.

**displayTitle** (string): The title of the chart component to be displayed.

**body** (string): Optional body text for the chart component.

**instruction** (string): This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.

**availableChartTypes** (array): An array of available chart types. Each chart type should be represented as an object with a `type` property. Currently 3 types of chart are supported (line, scatter and histogram).

**defaultChartType** (string): The default chart type to be displayed. Must match one of the available chart types.

**defaultXAxis** (string): The default label for the X-axis.

**defaultYAxis** (string): The default label for the Y-axis.

**defaultColorSelector** (string): The default color field selector.

**dataSource** (string): The path to the data source, such as a CSV file.

**height** (number): Set the height of the chart.

Line chart example:

### JSON Examples  

```JSON
{
  "_id": "c-15",
  "_parentId": "b-10",
  "_type": "component",
  "_component": "chartjsInteractive",
  "_classes": "",
  "_layout": "full",
  "title": "Title of the chart component",
  "displayTitle": "Title of the chart component",
  "body": "This is optional body text.",
  "instruction": "",
  "availableChartTypes": [
    {
      "type": "line"
    },
    {
      "type": "scatter"
    },
    {
      "type": "histogram"
    }
  ],
  "defaultChartType": "line",
  "defaultXAxis": "x-axis-label",
  "defaultYAxis": "y-axis-label",
  "defaultColorSelector": "color-field",
  "dataSource": "/path/to/data.csv",
  "height": 460
}
```
### Accessibility



## Limitations

----------------------------
**Version number:**  0.0.8   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>
**Framework versions:** 5.0.0  
**Author / maintainer:** David Tarrant 
**Accessibility support:** No   
**RTL support:** No  
