// Initialize Portfolio State
import {applyMiddleware, combineReducers, createStore} from "redux";
import {composeWithDevTools} from 'redux-devtools-extension/logOnlyInProduction';
import portfolio from "./reducers/portfolio";
import stocks from "./reducers/stocks";
import thunk from "redux-thunk";

const composeEnhancers = composeWithDevTools({});

export default createStore(
    combineReducers({
        portfolio,
        stocks
    }),
    composeEnhancers(
        applyMiddleware(thunk)
    )
);
