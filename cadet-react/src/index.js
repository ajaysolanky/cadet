// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import {BrowserRouter} from "react-router-dom"

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux'

import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Layout from './pages/Layout';
import WriteJD from './pages/WriteJD';
import UploadJD from './pages/UploadJD';
import EvaluateCandidates from './pages/EvaluateCandidates';
import store from './store'
import RequestInterview from './pages/RequestInterview';
import CandidateResponse from './pages/CandidateResponse';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="writejd" element={<WriteJD />} />
          <Route path="uploadjd" element={<UploadJD />} />
          <Route path="evalcandidates" element={<EvaluateCandidates />} />
          <Route path="requestinterview" element={<RequestInterview />} />
          <Route path="candidateresponse" element={<CandidateResponse />} />
          {/* </Route> */}
        </Routes>
        {/* <App /> */}
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
