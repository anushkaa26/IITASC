import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import "bulma/css/bulma.css";
import axios from "axios";

axios.defaults.withCredentials = true;
 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
