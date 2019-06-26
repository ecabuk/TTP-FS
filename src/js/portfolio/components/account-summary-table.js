import React from 'react';
import {connect} from 'react-redux';

class AccountSummaryTable extends React.PureComponent {
    render() {
        const {balance, totalValue} = this.props;

        return <table className="account-summary-table unstriped">
            <tbody>
            <tr>
                <th>Balance</th>
                <td>${balance.toFixed(2)}</td>
            </tr>
            <tr>
                <th>Assets Value</th>
                <td>${totalValue.toFixed(2)}</td>
            </tr>
            </tbody>
        </table>
    }
}

export default connect(
    ({stocks, portfolio}) => {
        const balance = portfolio.get('balance');
        const totalValue = portfolio.get('assets').reduce(
            (sum, asset) => sum + asset.get('count') * stocks.getIn(['symbols', asset.get('symbol'), 'last', 'price'])
            , .0);

        return {
            balance,
            totalValue
        }
    }
)(AccountSummaryTable);