import $ from 'jquery';
import types from './action-types';
import swal from "sweetalert";

export const updateFilters = filters => ({
    type: types.UPDATE_FILTERS,
    filters
});

const stopRequest = (response, page) => {
    const {error, data: {entries, count}} = response;

    if (error) {
        swal("Error", error || "Unknown error", "error");
    }

    return {
        type: types.REQUEST_STOP,
        error,
        page,
        entries,
        count
    }
};

export const startRequest = (filters, page) => {
    return (dispatch) => {
        dispatch({
            type: types.REQUEST_START
        });

        $.get(`${ttp.global.apiUrl}market/transactions`,
            Object.assign({}, filters, {page}),
            (response) => dispatch(stopRequest(response, page))
        ).fail((jqXHR, textStatus) => dispatch(stopRequest({error: `Communication Error: ${textStatus}`}, page)));
    }
};
