import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import "bootstrap/dist/css/bootstrap.min.css"
import "/node_modules/react-bootstrap/dist/react-bootstrap.js"
import "./index.css"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode className="container">
		<App />
	</React.StrictMode>
);
