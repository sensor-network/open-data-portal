import React from 'react'
import { Typography } from '@material-ui/core'
import ErrorIcon from '@material-ui/icons/Error'

const errorDisplay = {
  height: '300px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'white'
}

const ErrorDisplay = ({ error }) => {
  return (
    <div style={errorDisplay} className='error-display'>
      <ErrorIcon color='error' />
      <Typography variant='h5'>{error}</Typography>
    </div>
  )
}

export default ErrorDisplay;