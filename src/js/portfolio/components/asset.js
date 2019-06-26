import React from "react";
import {connect} from "react-redux";

class Asset extends React.PureComponent {
    render() {
        const {asset, columns} = this.props;

        return <tr className={this.getCls()}>
            <th className="col-symbol" scope="row">{asset.get('symbol')}</th>
            <td className="col-name">{asset.get('name')}</td>
            <td className="col-count">{asset.get('count')}</td>
            {columns.map(colId =>
                <td key={colId} className={`col-${colId} col-price`}>
                    {this.getColVal(colId)}
                </td>
            )}
        </tr>
    }

    getCls() {
        const {asset, colorBy} = this.props;

        const cls = [
            'asset-row'
        ];

        // Set color by comparing value with average
        if (colorBy) {
            const val = this.getColVal(colorBy);
            const avg = asset.get('avg');

            if (val) {
                if (avg > val) cls.push('status-bad');
                else if (val > avg) cls.push('status-good');
            }
        }

        return cls.join(' ');
    }

    getColVal(colId) {
        const {asset} = this.props;

        const val = colId === 'last'
            ? asset.getIn(['last', 'price'])
            : asset.get(colId);

        return val ? val.toFixed(2) : 'N/A'
    }
}

export default connect(
    ({portfolio}) => ({
        colorBy: portfolio.getIn(['options', 'colorBy'])
    })
)(Asset);