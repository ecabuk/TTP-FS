import React from 'react';
import ReactDOM from 'react-dom';
import store from "./store";
import {Provider} from "react-redux";
import FilterBox from "./components/filter-box";
import EntriesTable from './components/transactions-table';
import Pagination from './components/pagination';
import actionTypes from './action-types';
import {startRequest} from './actions'

class TransactionsApp extends React.PureComponent {
    render() {
        return <div className="grid-container">
            <div className="grid-x grid-margin-x grid-padding-y">
                <div className="cell large-8">
                    <EntriesTable/>
                    <Pagination/>
                </div>
                <div className="cell large-4">
                    <FilterBox/>
                </div>
            </div>
        </div>
    }

    static renderApp(
        options,
        rootContainer
    ) {
        store.dispatch({type: actionTypes.INITIALIZE});
        store.dispatch(startRequest({per_page: 10}, 1));

        // Place the app to DOM
        ReactDOM.render(<Provider store={store}>
            <TransactionsApp {...options}/>
        </Provider>, rootContainer);
    }
}

export default TransactionsApp;