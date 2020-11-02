import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './library/redux/store';

import './index.scss';

const ElementQueries = require('css-element-queries');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

ElementQueries.ElementQueries.listen();
