import React from 'react';
import { NavLink } from 'react-router-dom';
import { RefreshCw, Frown } from 'react-feather';

//header for tables (with refresh button and a link)
export const ExistingRowsHeader = (props) => {
  return (
    <div className="selectorRow headerRow noselect">
      <div className="selectorCell">
        <div className="selectorCellButtonWrapper">
          <RefreshCw
            className="selectorButton"
            onClick={props.onRefresh}
          />
        </div>
      </div>
      <div className="selectorCell">
        <p className="margin-right">
          <NavLink to={props.link}>
            {props.linkText}
          </NavLink>
        </p>
      </div>
    </div>
  )
}

//to show when loading rows
export const LoadingRow = (props) => {
  return (
    <div className="selectorRow fatRow loadingRow">
      <div>
        <RefreshCw className="loadingRowRefresh is-48" />
        <p>{props.loadingMessage}</p>
        <p>Just wait one second!</p>
      </div>
    </div>
  )
}

//to show when there are no rows available
export const NoRoomsRow = (props) => {
  return (
    <div className="selectorRow fatRow noRow">
      <div>
        <Frown className="is-48" />
        <p>{props.noRowsMessage}</p>
        <NavLink to={props.link}>Make a new one!</NavLink>
      </div>
    </div>
  )
}
