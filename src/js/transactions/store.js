import {applyMiddleware, createStore, combineReducers} from "redux";
import thunk from "redux-thunk";
import {composeWithDevTools} from 'redux-devtools-extension/logOnlyInProduction';
import reducer from './reducer';

const composeEnhancers = composeWithDevTools({});

export default createStore(
    reducer,
    composeEnhancers(
        applyMiddleware(thunk)
    )
);