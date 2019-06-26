import actions from '../action-types';
import {fromJS} from "immutable";
import {symbolComparator} from "../../utils";

export default (state = {}, action) => {
    switch (action.type) {
        case actions.INITIALIZE:
            return (() => {
                const sState = {
                    symbols: {},
                    tmpSubscribed: null
                };

                // Initialize Stocks State
                JSON.parse(document.getElementById('user-portfolio-data').textContent).assets.forEach(({symbol, name}) => {
                    sState.symbols[symbol] = {
                        symbol,
                        name,
                        last: {
                            price: null,
                            time: 0,
                            seq: 0
                        },
                        open: null,
                        high: null,
                        low: null,
                        close: null
                    }
                });

                return fromJS(sState).update('symbols', symbols => symbols.sortBy(symbol => symbol.get('symbol'), symbolComparator));
            })();
        case actions.SET_TMP_TRACKING:
            return state.set('tmpSubscribed', action.symbol);
        case actions.UNSET_TMP_TRACKING:
            return state.set('tmpSubscribed', null);
        case actions.UPDATE_STOCK_LAST_PRICE:
            if (
                state.hasIn(['symbols', action.symbol]) &&
                state.getIn(['symbols', action.symbol, 'last', 'seq']) >= action.seq
            ) {
                return state;  // Old update, pass
            }

            return state.mergeIn(['symbols', action.symbol, 'last'], {
                price: action.price,
                time: action.time,
                seq: action.seq
            });
        case actions.UPDATE_STOCK_OHLC:
            return state.mergeIn(['symbols', action.symbol], {
                open: action.open,
                high: action.high,
                low: action.low,
                close: action.close,
            });
        case actions.STOP_ACTION_BUY:
            // Clear tmp subscription on successful buy
            return action.error
                ? state
                : state.merge({
                    tmpSubscribed: null
                });
        default:
            return state
    }
}