import types from './action-types';
import {fromJS} from 'immutable';

export default (state = {}, action) => {
    switch (action.type) {
        case types.INITIALIZE:
            return (() => {
                return fromJS({
                    busy: false,
                    count: 0,
                    page: 1,
                    entries: [],
                    filters: {
                        per_page: 10,
                    }
                })
            })();
        case types.UPDATE_FILTERS:
            return state.mergeIn(['filters'], fromJS(action.filters));
        case types.REQUEST_START:
            return state.set('busy', 'request');
        case types.REQUEST_STOP:
            return state.withMutations(state => {
                state.set('busy', false);

                if (action.error)
                    return;

                const {page, entries, count} = action;
                state.merge({
                    page,
                    count,
                    entries: fromJS(entries)
                });
            });
        default:
            return state;
    }
}