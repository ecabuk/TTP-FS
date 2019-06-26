import $ from 'jquery';
import React from 'react';
import {connect} from 'react-redux';
import {updateFilters, startRequest} from '../actions';

class FilterBox extends React.PureComponent {
    render() {
        const {busy} = this.props;
        const onFieldChange = this.handleFormChange.bind(this);

        return <div className="callout">
            <h5>Buy</h5>
            <hr/>
            <form onSubmit={this.handleFormSubmit.bind(this)} ref="form">
                <label>
                    Order By
                    <select name="order_by"
                            defaultValue="date"
                            onChange={onFieldChange}>
                        <option value="total">Total</option>
                        <option value="qty">Qty</option>
                        <option value="date">Date</option>
                    </select>
                </label>
                <label>
                    Order
                    <select name="order"
                            defaultValue="desc"
                            onChange={onFieldChange}>
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </label>
                <label>
                    From Date
                    <input type="date"
                           name="start"
                           placeholder="YYYY-MM-DD"
                           onChange={onFieldChange}/>
                </label>
                <label>
                    From Date
                    <input type="date"
                           name="end"
                           placeholder="YYYY-MM-DD"
                           onChange={onFieldChange}/>
                </label>
                <div className="grid-x grid-margin-x">
                    <div className="medium-6 cell">
                        <label>
                            Total Min
                            <input type="number"
                                   step={1}
                                   min={0}
                                   name="total_min"
                                   placeholder={99}
                                   onChange={onFieldChange}/>
                        </label>
                    </div>
                    <div className="medium-6 cell">
                        <label>
                            Total Max
                            <input type="number"
                                   step={1}
                                   min={0}
                                   name="total_max"
                                   placeholder={9999}
                                   onChange={onFieldChange}/>
                        </label>
                    </div>
                </div>

                <button type="submit" className="button secondary expanded" disabled={busy}>Filter</button>
            </form>
        </div>
    }

    handleFormChange() {
        const filters = {};
        $(this.refs.form).serializeArray().forEach(({name, value}) => filters[name] = value);

        this.props.updateFilters(filters);
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const {filters, startRequest} = this.props;

        startRequest(filters.toJS(), 1);
    }
}

export default connect(
    (state) => ({
        filters: state.get('filters'),
        busy: state.get('busy'),
    }),
    {
        updateFilters,
        startRequest
    }
)(FilterBox);