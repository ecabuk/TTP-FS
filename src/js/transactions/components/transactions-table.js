import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

class Transaction extends React.PureComponent {
    render() {
        const {transaction: t} = this.props;
        return <tr className="transaction-row">
            <td className="col-symbol">{t.get('symbol')}</td>
            <td className="col-name">{t.get('name')}</td>
            <td className="col-qty">{t.get('qty')}</td>
            <td className="col-price">{t.get('price').toFixed(2)}</td>
            <td className="col-total">{t.get('total').toFixed(2)}</td>
            <td className="col-date">{moment(t.get('date')).format('lll')}</td>
        </tr>
    }
}

class TransactionsTable extends React.PureComponent {
    render() {
        const {transactions} = this.props;

        return <table className="hover transactions-table">
            <thead>
            <tr>
                <th className="col-symbol">Symbol</th>
                <th className="col-name">Name</th>
                <th className="col-qty">Qty</th>
                <th className="col-price">Price</th>
                <th className="col-total">Total</th>
                <th className="col-date">Date</th>
            </tr>
            </thead>
            <tbody>
            {transactions.count() > 0
                ? transactions.toSeq().map(transaction =>
                    <Transaction key={transaction.get('date')}
                                 transaction={transaction}/>
                )
                : <tr>
                    <td colSpan={6}>No transactions found.</td>
                </tr>}
            </tbody>
        </table>
    }
}

export default connect(
    state => ({
        transactions: state.get('entries')
    })
)(TransactionsTable);