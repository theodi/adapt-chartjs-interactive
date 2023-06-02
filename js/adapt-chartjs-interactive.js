
import Adapt from 'core/js/adapt';
import ChartJSInteractiveView from './chartjsInteractiveView';
import ChartJSInteractiveModel from './chartjsInteractiveModel';

export default Adapt.register("chartjsInteractive", {
    view: ChartJSInteractiveView,
    model: ChartJSInteractiveModel
});

