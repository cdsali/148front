import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import  { store,setRH2Data, setProjects } from './store'

createRoot(document.getElementById('root')).render(
  
  <Provider store={store}>
    <App />
  </Provider>,
)
