// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Đảm bảo rằng file index.css hoặc các tệp css khác được import ở đây
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap provider around App and pass store as prop */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
