import $ from 'jquery';
import React from 'react';
import {connect} from 'react-redux'
import {setTmpTracking, unsetTmpTracking, buyStock} from '../actions'
import OrderSummaryTable from './order-summary-table';
import 'selectize/dist/js/selectize';

class OrderBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            qty: '',
        }
    }

    componentDidMount() {
        this.selectize = $(this.refs.tickerSelect).selectize({
            load: this.handleSymbolSearch
        }).get(0).selectize;

        this.selectize.on('change', this.onSelectizeChange.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // Do not update if these keys are same
        const propKeys = [
            'busy',
            'balance',
            'tmpSymbol',
            'tmpPrice',
        ];

        for (let i = 0; i < propKeys.length; i++) {
            let key = propKeys[i];
            if (this.props[key] !== nextProps[key])
                return true;
        }

        if (this.state.qty !== nextContext.qty) {
            return true;
        }

        return false;
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        // Check if temporary symbols is cleared
        if (this.props.tmpSymbol && !nextProps.tmpSymbol) {
            // Clear selections after successful buy operation
            this.selectize.clear();
            this.setState({qty: ''});
            this.refs.qtyInput.value = '';
        }
    }

    render() {
        const {qty} = this.state;
        const {busy, tmpSymbol, tmpPrice} = this.props;
        const canBuy = this.canBuy();

        return <div className="callout">
            <h5>Buy</h5>
            <hr/>
            <form action="#" onSubmit={this.handleFormSubmit.bind(this)}>
                <label>Ticker</label>
                <select ref="tickerSelect"/>

                <label>Qty</label>
                <input type="number" ref="qtyInput" step={1}
                       onChange={this.onQtyChange.bind(this)}/>

                {tmpSymbol
                    ? <OrderSummaryTable {...{qty, tmpSymbol, tmpPrice}}/>
                    : null}

                <button type="submit" className="button secondary expanded"
                        disabled={!canBuy || busy}>{busy ? 'Please wait...' : 'Commit to Buy'}</button>
            </form>
        </div>
    }

    onSelectizeChange(val) {
        this.props.setTmpTracking(val);
    }

    onQtyChange(e) {
        e.preventDefault();

        this.setState({qty: parseInt(this.refs.qtyInput.value)});
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const {qty} = this.state;
        const {busy, tmpSymbol, buyStock} = this.props;

        if (!this.canBuy() || busy)
            return;

        buyStock(tmpSymbol, qty);
    }

    /**
     * Checks whether user can buy the selected stocks.
     *
     * @returns {null|false|float} Returns null if there is no selection, false if cannot buy, total price if can buy.
     */
    canBuy() {
        const {qty} = this.state;
        const {tmpSymbol, tmpPrice, balance} = this.props;

        if (!tmpSymbol || !qty)
            return null;

        const total = tmpPrice * parseFloat(qty);

        return total >= balance
            ? false
            : total;
    }

    handleSymbolSearch(query, cb) {
        if (!query)
            return cb();

        $.get(
            `${ttp.global.apiUrl}market/symbols/search/${query}`,
            response => {
                if (!response.success)
                    return cb();

                cb(response.data.map(({symbol, name}) => ({value: symbol, text: `(${symbol}) ${name}`})))
            })
    }
}

export default connect(
    ({portfolio, stocks}) => {
        return {
            busy: portfolio.get('busy') === 'buy',
            balance: portfolio.get('balance'),
            tmpSymbol: stocks.get('tmpSubscribed'),
            tmpPrice: stocks.getIn(['symbols', stocks.get('tmpSubscribed'), 'last', 'price']),
            symbols: stocks.get('symbols')
        }
    },
    {
        setTmpTracking,
        unsetTmpTracking,
        buyStock
    }
)(OrderBox);