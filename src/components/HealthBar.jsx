import React from 'react'
import {
  TableCell,
  TableRow,
  ListItemText,
  Collapse,
  ListItemIcon,
  List,
  ListItem
} from '@material-ui/core'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import StatusIcon from './StatusIcon'

const HealthBar = ({ component, subComponents }) => {
  const [open, setOpen] = React.useState(false, true)

  function handleClick() {
    setOpen(!open)
  }

  return (
    <TableRow style={{ verticalAlign: 'top' }}>
      <TableCell align='left' style={{ width: '1%' }}>
        <StatusIcon
          status={component.status}
          title={
            component.lastCheckTime
              ? new Date(component.lastCheckTime).toString()
              : ''
          }
          style={{ margin: '8px 0px' }}
        />
      </TableCell>
      <TableCell component='th' scope='row' style={{ width: '100%' }}>
        <ListItem button onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText
            primary={component.name}
            size='small'
            dense='true'
            style={{
              width: '200px',
              margin: '0.1em'
            }}
          />
          <div>
            {component.datapoints &&
              component.datapoints.map((item) => {
                return (
                  <StatusIcon
                    key={item.timestamp}
                    status={item.value}
                    title={new Date(parseInt(item.timestamp)).toString()}
                  />
                )
              })}
          </div>
        </ListItem>
        <Collapse in={open} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {subComponents.map((subComponent) => {
              return (
                <ListItem key={subComponent.name}>
                  <ListItemIcon>
                    <StatusIcon
                      status={subComponent.status}
                      title={
                        subComponent.lastCheckTime
                          ? new Date(subComponent.lastCheckTime).toString()
                          : ''
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subComponent.name}
                    size='small'
                    dense='true'
                    style={{
                      width: '200px',
                      margin: '0.1em'
                    }}
                  />
                  <div>
                    {subComponent.datapoints.map((item) => {
                      return (
                        <StatusIcon
                          key={item.timestamp}
                          status={item.value}
                          title={new Date(parseInt(item.timestamp)).toString()}
                          style={{
                            width: '0.8em',
                            margin: '0.1em'
                          }}
                        />
                      )
                    })}
                  </div>
                </ListItem>
              )
            })}
          </List>
        </Collapse>
      </TableCell>
      <TableCell align='left'>
        {component.status === 1 ? 'Healthy' : 'Unhealthy'}
      </TableCell>
    </TableRow>
  )
}

export default HealthBar