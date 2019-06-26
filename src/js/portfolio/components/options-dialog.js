import React from 'react';
import ReactDOM from 'react-dom';
import {connect, Provider} from 'react-redux';
import store from '../store';
import {setOption} from '../actions';
import {Reveal} from 'foundation-sites/dist/js/foundation.es6'

export const COLUMNS = {
    avg: "Avg. Cost",
    last: "Last Price",
    high: "High",
    low: "Low",
    open: "Open",
    close: "Close"
};

export const COLOR_BY = Object.keys(COLUMNS)
    .filter(colId => colId !== 'avg');


class OptionsDialog extends React.PureComponent {
    render() {
        return <div className="portfolio-options-dialog">
            <h4>Options</h4>
            <fieldset className="fieldset">
                <legend>Columns</legend>
                {Object.keys(COLUMNS).map(colId => <ColumnOption key={colId} colId={colId}/>)}
            </fieldset>
            <ColorByOption/>
        </div>
    }

    static openDialog() {
        const $container = $('<div class="reveal"/>');

        ReactDOM.render(
            <Provider store={store}>
                <OptionsDialog/>
            </Provider>,
            $container.get(0)
        );

        new Reveal($container, {});

        $container
            .foundation('open')
            .on('closed.zf.reveal', () => $container.parent().remove());
    }
}

const ColumnOption = connect(
    ({portfolio}, {colId}) => {
        return {
            checked: portfolio.getIn(['options', 'columns', colId])
        }
    },
    (dispatch, {colId}) => {
        return {
            onChange: (e) => dispatch(setOption(e.target.checked, ['columns', colId]))
        }
    }
)(class extends React.PureComponent {
    render() {
        const {colId, checked, onChange} = this.props;

        return <div>
            <label>
                <input type="checkbox" onChange={onChange} defaultChecked={checked}/>
                <span>{COLUMNS[colId]}</span>
            </label>
        </div>
    }
});

const ColorByOption = connect(
    ({portfolio}) => ({
        value: portfolio.getIn(['options', 'colorBy'])
    }),
    (dispatch) => ({
        onChange: (e) => dispatch(setOption($(e.target).val(), ['colorBy']))
    })
)(class extends React.PureComponent {
    render() {
        const {onChange, value} = this.props;

        return <fieldset className="fieldset">
            <legend>Color By</legend>
            <select defaultValue={value} onChange={onChange}>
                <option value={0}>No Coloring</option>
                {COLOR_BY.map(colId =>
                    <option key={colId} value={colId}>{COLUMNS[colId]}</option>
                )}
            </select>
        </fieldset>
    }
});

export default OptionsDialog;

