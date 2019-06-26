import React from 'react';
import {connect} from 'react-redux';

class OrderSummaryTable extends React.PureComponent {
    render() {
        const {last, qty, open, close, high, low} = this.props;

        const total = (last && qty)
            ? last * qty
            : null;

        return <table className="order-summary-table unstriped">
            <tbody>
            {(open && close)
                ? [
                    <tr key="open-close-head" className="open-close-head">
                        <th>Open</th>
                        <th>Close</th>
                    </tr>,
                    <tr key="open-close-body" className="open-close-body">
                        <td>{open.toFixed(2)}</td>
                        <td>{close.toFixed(2)}</td>
                    </tr>
                ]
                : null}
            {(high && low)
                ? [
                    <tr key="high-low-head" className="high-low-head">
                        <th>High</th>
                        <th>Low</th>
                    </tr>,
                    <tr key="high-low-body" className="high-low-body">
                        <td>{high.toFixed(2)}</td>
                        <td>{low.toFixed(2)}</td>
                    </tr>
                ]
                : null}
            <tr>
                <th>Last Price</th>
                <td>${last ? last.toFixed(2) : 'N/A'}</td>
            </tr>
            {qty
                ? <tr>
                    <th>Quantity</th>
                    <td>{qty}</td>
                </tr> : null}
            {total
                ? <tr>
                    <th>Total</th>
                    <td>${total ? total.toFixed(2) : 'N/A'}</td>
                </tr>
                : null}
            </tbody>
        </table>
    }
}

export default connect(
    ({stocks}) => {
        const selected = stocks.getIn(['symbols', stocks.get('tmpSubscribed')]);

        if (!selected || !selected.get('last'))
            return {}; // Not loaded yet

        const {last: {price: last}, open, close, high, low} = selected.toJS();

        return {
            last,
            open,
            close,
            high,
            low
        };
    }
)(OrderSummaryTable);