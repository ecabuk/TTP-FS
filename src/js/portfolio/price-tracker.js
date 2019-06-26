import $ from 'jquery';
import io from 'socket.io-client';
import {updateLastPrice, updateOHLC} from './actions';

const OHLC_INTERVAL = 60000; // 60 sec

class PriceTracker {
    constructor(store) {
        this.store = store;
        this.subscribed = {};

        // Initiate last price socket
        this.socketLast = io(`${ttp.global.iex.socketApiBase}last`);
        this.socketLast.on('message', this.handleLastMessage.bind(this));

        // Store subscriber
        this.store.subscribe(this.handleStateChange.bind(this));

        // Subscribe to channels
        this.socketLast.on('connect', this.handleStateChange.bind(this));
    }

    handleLastMessage(payload) {
        const {symbol, price, time, seq} = JSON.parse(payload);
        this.store.dispatch(updateLastPrice(symbol, price, time, seq));
    }

    initiateInterval(symbol) {
        this.getOHLCData(symbol);  // Call for the first time

        this.subscribed[symbol] = setInterval(
            () => this.getOHLCData(symbol),
            OHLC_INTERVAL
        );
    }

    clearInterval(symbol) {
        if (symbol in this.subscribed) {
            clearInterval(this.subscribed[symbol]);
        }
    }

    getOHLCData(symbol) {
        $.get(
            `${ttp.global.iex.restApiBase}stock/${symbol}/ohlc`,
            ({
                 open: {price: open},
                 high,
                 low,
                 close: {price: close}
             }) => this.store.dispatch(updateOHLC(symbol, open, high, low, close))
        );
    }

    handleStateChange() {
        const {portfolio, stocks} = this.store.getState();
        const newState = portfolio.get('assets').toSeq().map(asset => asset.get('symbol')).toArray();
        const tmpSubscribed = stocks.get('tmpSubscribed');

        if (tmpSubscribed)
            newState.push(tmpSubscribed);

        // Determine which ones new
        const subscribe = newState
            .filter(symbol => !(symbol in this.subscribed));

        // Determine which ones deleted
        const unsubscribe = Object.keys(this.subscribed)
            .filter(symbol => -1 === newState.indexOf(symbol));

        // Subscribe
        if (subscribe.length > 0) {
            // Last
            this.socketLast.emit('subscribe', subscribe.join(','));

            // OHLC
            subscribe.forEach(this.initiateInterval.bind(this));
        }

        // Unsubscribe
        if (unsubscribe.length > 0) {
            // Last
            this.socketLast.emit('unsubscribe', unsubscribe.join(','));

            // OHLC
            unsubscribe.forEach(this.clearInterval.bind(this));
        }
    }
}

export default PriceTracker;