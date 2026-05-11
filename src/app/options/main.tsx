import React from 'react'
import ReactDOM from 'react-dom/client'
import '../../main'
import Options from './Options'
import './styles.css'
import ErrorBoundary from '../../components/shared/ErrorBoundary'

const root = ReactDOM.createRoot(document.getElementById('options-root')!)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Options />
    </ErrorBoundary>
  </React.StrictMode>
)
