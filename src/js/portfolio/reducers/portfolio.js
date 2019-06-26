import {fromJS, Map} from 'immutable';
import {symbolComparator} from "../../utils";
import types from '../action-types';

export default function todoApp(state = {}, action) {
    switch (action.type) {
        case types.INITIALIZE:
            return (() => {
                return fromJS(JSON.parse(document.getElementById('user-portfolio-data').textContent))
                    .update('assets', assets => assets.sortBy(symbol => symbol.get('symbol'), symbolComparator))
                    .merge({
                        busy: false,
                        options: fromJS({
                            columns: {
                                avg: true,
                                last: true
                            },
                            colorBy: 'last'
                        })
                    })
            })();
        case types.SET_OPTION:
            return state.setIn(['options'].concat(action.path), action.value);
        case types.START_ACTION_BUY:
            return state.set('busy', 'buy');
        case types.STOP_ACTION_BUY:
            return state.withMutations(state => {
                state.set('busy', false);

                if (action.error)
                    return;

                // Set new balance
                state.set('balance', action.newBalance);

                // Update stock
                const {symbol, name, count, avg} = action.stockData;
                state.update('assets', assets => {
                    const idx = assets.findIndex(asset => asset.get('symbol') === symbol);

                    const asset = Map({
                        symbol,
                        name,
                        count,
                        avg
                    });

                    return (
                        idx === -1
                            ? assets.push(asset)
                            : assets.set(idx, asset)
                    ).sortBy(
                        asset => asset.get('symbol'),
                        symbolComparator
                    );
                });
            });
        default:
            return state
    }
}