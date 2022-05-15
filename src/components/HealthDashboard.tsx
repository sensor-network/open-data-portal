/***
 * MIT Licensed by https://github.com/keetmalin. Original repo: https://github.com/Keetmalin/react-health-dashboard
 * Brought in by source due to dependenct tree issues with old version of React in original repo.
 **/

import React from "react";
import { formatRelative } from "date-fns";
import { makeStyles } from "@mui/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
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

const StatusIcon: React.FC<{
  status: number;
  title: string;
  style?: {};
}> = ({ status, title, style = {} }) => {
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

export type HealthBarComponent = {
  name: string;
  status: number;
  statusMessage?: string;
  lastCheckTime: Date;
  elements: HealthBarComponent[] | null;
};

const HealthBar: React.FC<{
  component: HealthBarComponent;
  subComponents: HealthBarComponent[];
}> = ({ component, subComponents }) => {
  const [open, setOpen] = React.useState(false);

  function handleClick() {
    setOpen(!open);
  }

  return (
    <TableRow style={{ verticalAlign: "top" }}>
      <TableCell align="left" style={{ width: "1%" }}>
        <StatusIcon
          status={component.status}
          title={component.statusMessage ? component.statusMessage : ""}
          style={{ margin: "8px 0px" }}
        />
      </TableCell>
      <TableCell component="th" scope="row" style={{ width: "100%" }}>
        <ListItem button onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText
            primary={component.name}
            style={{
              width: "200px",
              margin: "0.1em",
            }}
          />
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {subComponents.map((subComponent) => {
              return Array.isArray(subComponent.elements) ? (
                <Table key={subComponent.name}>
                  <TableBody>
                    <HealthBar
                      component={subComponent}
                      subComponents={subComponent.elements}
                    />
                  </TableBody>
                </Table>
              ) : (
                <ListItem key={subComponent.name}>
                  <ListItemIcon>
                    <StatusIcon
                      status={subComponent.status}
                      title={
                        subComponent.statusMessage
                          ? subComponent.statusMessage
                          : ""
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subComponent.name}
                    style={{
                      width: "200px",
                      margin: "1.0em",
                    }}
                  />
                  <ListItemText
                    primary={formatRelative(
                      subComponent.lastCheckTime,
                      new Date()
                    )}
                    style={{ textAlign: "right", width: "300px" }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

const HealthDashboard: React.FC<{
  data: HealthBarComponent[];
}> = ({ data }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Table className={classes.table} size="small">
        <TableBody>
          {data.map((item) => {
            return (
              item.elements !== null && (
                <HealthBar
                  key={item.name}
                  component={item}
                  subComponents={item.elements}
                />
              )
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default HealthDashboard;
