import 'date-fns'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@material-ui/core'

import HealthBar from './HealthBar'

import ErrorDisplay from './ErrorDisplay'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: 3,
    overflowX: 'auto'
  },
  selectEnv: {
    padding: '12px'
  },
  table: {
    minWidth: 650
  },
  loadingBox: {
    height: '65px'
  },
  loading: {
    margin: '20px auto',
    display: 'block'
  },
  filter: {
    width: '100px'
  }
}))

const HealthDashboard = (props) => {
  const { data, loading, error } = props

  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      {loading ? (
        <LinearProgress />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <Table className={classes.table} size='small'>
          <TableHead>
            <TableRow>
              <TableCell align='left' />
              <TableCell align='center'>Component</TableCell>
              <TableCell align='left'>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              return (
                <HealthBar
                  key={item.name}
                  component={item}
                  subComponents={item.elements}
                />
              )
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
}

export default HealthDashboard;