import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import store from './store';
import AccountSummaryTable from './components/account-summary-table';
import AssetList from './components/asset-list';
import OrderBox from './components/order-box';
import priceTracker from './price-tracker';
import actionTypes from './action-types';

class PortfolioApp extends React.PureComponent {
    render() {
        return <div className="grid-container">
            <div className="grid-x grid-margin-x grid-padding-y">
                <div className="cell large-8">
                    <AssetList/>
                </div>
                <div className="cell large-4">
                    <OrderBox/>
                    <AccountSummaryTable/>
                </div>
            </div>
        </div>
    }

    static renderApp(
        options,
        rootContainer
    ) {
        store.dispatch({type: actionTypes.INITIALIZE});

        // Initialize Price Tracker
        new priceTracker(store);

        // Place the app to DOM
        ReactDOM.render(<Provider store={store}>
            <PortfolioApp {...options}/>
        </Provider>, rootContainer);
    }
}

export default PortfolioApp;