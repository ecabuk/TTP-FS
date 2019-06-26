import React from 'react';
import PortfolioApp from './portfolio';
import TransactionsApp from './transactions';
import {getCSRFToken} from "./utils";

// Set DJANGO CSRF Token
$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
        }
    }
});


// Global Namespace
window.ttp = {
    global: {
        apiUrl: '/api/v1/',
        iex: {
            restApiBase: 'https://api.iextrading.com/1.0/',
            socketApiBase: 'https://ws-api.iextrading.com/1.0/'
        },
    },
    screens: {
        PortfolioApp,
        TransactionsApp
    }
};

// App Renderer
ttp.renderApp = (
    appName,
    props,
    rootContainer = document.getElementById('root')
) => {
    const App = appName in ttp.screens
        ? ttp.screens[appName]
        : <div className="error">Screen App Not Exists</div>;

    App.renderApp(props, rootContainer);
};