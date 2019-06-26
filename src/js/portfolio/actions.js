import $ from 'jquery';
import swal from 'sweetalert';
import types from './action-types';

export const setOption = (value, path) => ({
    type: types.SET_OPTION,
    value,
    path
});

export const setTmpTracking = (symbol) => ({
    type: types.SET_TMP_TRACKING,
    symbol
});

export const unsetTmpTracking = () => ({
    type: types.UNSET_TMP_TRACKING
});

export const updateLastPrice = (symbol, price, time, seq) => ({
    type: types.UPDATE_STOCK_LAST_PRICE,
    symbol,
    price,
    time,
    seq: seq || 0
});

export const updateOHLC = (symbol, open, high, low, close) => ({
    type: types.UPDATE_STOCK_OHLC,
    symbol,
    open,
    high,
    low,
    close,
});

const startActionBuy = () => ({
    type: types.START_ACTION_BUY
});

const stopActionBuy = (response) => {
    const {error, stockData, tnxData, balance} = response;

    if (error) {
        swal("Error", error || "Unknown error", "error");
    } else {
        const unitPrice = parseFloat(tnxData.price);
        const total = tnxData.qty * unitPrice;

        swal('Success!', `Your order of ${tnxData.qty} x ${stockData.symbol} ($${unitPrice.toFixed(2)}) successfully executed for a total of $${total.toFixed(2)}`, 'success')
    }

    return {
        type: types.STOP_ACTION_BUY,
        error,
        newBalance: parseFloat(balance),
        stockData: Object.assign({}, stockData, {avg: parseFloat(stockData.avg)}),
    }
};

export const buyStock = (symbol, qty) => {
    return dispatch => {
        dispatch(startActionBuy());

        $.post(`${ttp.global.apiUrl}market/action`, {
                type: 'buy',
                symbol,
                qty
            },
            response => dispatch(stopActionBuy(response))
        ).fail((jqXHR, textStatus) => dispatch(stopActionBuy({error: `Communication Error: ${textStatus}`})));
    };
};
