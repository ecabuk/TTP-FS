import React from 'react';
import VerticalDotsIcon from '../../icons/vertical-dots';
import OptionsDialog from './options-dialog';
import {connect} from 'react-redux';
import {COLUMNS} from './options-dialog';
import Asset from './asset';


class AssetList extends React.PureComponent {
    render() {
        const {assets, columns} = this.props;

        return <table className="user-assets-table unstriped hover">
            <thead>
            <tr>
                <th className="col-symbol" scope="col">
                    <button className="menu-button button hollow secondary" onClick={OptionsDialog.openDialog}>
                        <VerticalDotsIcon className="menu-icon"/>
                    </button>
                </th>
                <th className="col-name" scope="col">Name</th>
                <th className="col-count" scope="col">Qty</th>
                {columns.map(colId =>
                    <th key={colId} className={`col-${colId} col-price`} scope="col">{COLUMNS[colId]}</th>
                )}
            </tr>
            </thead>
            <tbody>
            {assets.count() > 0
                ? assets.toSeq().map(asset =>
                    <Asset key={asset.get('symbol')} asset={asset} columns={columns}/>
                )
                : <tr>
                    <td colSpan={columns.length+3}>No assets</td>
                </tr>
            }
            </tbody>
        </table>
    }
}

export default connect(
    state => {
        const assets = state.portfolio.get('assets').map(
            asset => asset.merge(state.stocks.getIn(['symbols', asset.get('symbol')]))
        );

        return {
            assets,
            columns: Object.keys(COLUMNS)
                .filter(colId => state.portfolio.getIn(['options', 'columns', colId])),
        }
    }
)(AssetList);