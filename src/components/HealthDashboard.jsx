/***
 * MIT Licensed by https://github.com/keetmalin. Original repo: https://github.com/Keetmalin/react-health-dashboard
 * Brought in by source due to dependenct tree issues with old version of React in original repo.
 **/

import React from "react";
import "date-fns";
import { makeStyles } from "@mui/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: 3,
    overflowX: "auto",
  },
  selectEnv: {
    padding: "12px",
  },
  table: {
    minWidth: 650,
  },
  loadingBox: {
    height: "65px",
  },
  loading: {
    margin: "20px auto",
    display: "block",
  },
  filter: {
    width: "100px",
  },
}));

const errorDisplay = {
  height: "300px",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
};

const ErrorDisplay = ({ error }) => {
  return (
    <div style={errorDisplay} className="error-display">
      <ErrorIcon color="error" />
      <Typography variant="h5">{error}</Typography>
    </div>
  );
};

const StatusIcon = ({ status, title, style }) => {
  let statusIconColor;
  if (status === 1) {
    statusIconColor = "#258933";
  } else if (status === 0) {
    statusIconColor = "#ff0000";
  } else if (status > 0 && status < 1) {
    statusIconColor = "#ebc034";
  } else {
    statusIconColor = "#918f89";
  }
  return (
    <Tooltip title={title}>
      <FiberManualRecordIcon style={{ color: statusIconColor, ...style }} />
    </Tooltip>
  );
};

const HealthBar = ({ component, subComponents }) => {
  const [open, setOpen] = React.useState(false, true);

  function handleClick() {
    setOpen(!open);
  }

  return (
    <TableRow style={{ verticalAlign: "top" }}>
      <TableCell align="left" style={{ width: "1%" }}>
        <StatusIcon
          status={component.status}
          title={
            component.lastCheckTime
              ? new Date(component.lastCheckTime).toString()
              : ""
          }
          style={{ margin: "8px 0px" }}
        />
      </TableCell>
      <TableCell component="th" scope="row" style={{ width: "100%" }}>
        <ListItem button onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText
            primary={component.name}
            size="small"
            dense="true"
            style={{
              width: "200px",
              margin: "0.1em",
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
                );
              })}
          </div>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {subComponents.map((subComponent) => {
              return (
                <ListItem key={subComponent.name}>
                  <ListItemIcon>
                    <StatusIcon
                      status={subComponent.status}
                      title={
                        subComponent.lastCheckTime
                          ? new Date(subComponent.lastCheckTime).toString()
                          : ""
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subComponent.name}
                    size="small"
                    dense="true"
                    style={{
                      width: "200px",
                      margin: "0.1em",
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
                            width: "0.8em",
                            margin: "0.1em",
                          }}
                        />
                      );
                    })}
                  </div>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </TableCell>
      <TableCell align="left">
        {component.status === 1 ? "Healthy" : "Unhealthy"}
      </TableCell>
    </TableRow>
  );
};

const HealthDashboard = (props) => {
  const { data, loading, error } = props;

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      {loading ? (
        <LinearProgress />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left" />
              <TableCell align="center">Component</TableCell>
              <TableCell align="left">Status</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default HealthDashboard;
