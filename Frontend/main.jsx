import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductManager from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<ProductManager />);
