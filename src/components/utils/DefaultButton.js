import React, { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

const DefaultButton = forwardRef(({
  id,
  className,
  text,
  navlink, href, button,
  bordered, inverted,
  onClick,
  icon
}, ref) => {
  const invertedClass = (inverted) ? "is-inverted" : "";
  const borderedClass = (bordered) ? "is-bordered" : "";

  const props = {
    id: id,
    className: `defaultButton noselect ${invertedClass} ${borderedClass} ${className}`,
    onClick: onClick,
    ref: ref,
  }

  //a tag, navlink, or div tag
  if (navlink){
    props.to = navlink;
    return (<NavLink {...props}><Icon icon={icon}/>{ text }</NavLink>);
  }
  else if (href){
    props.href = href;
    return (<a target="_blank" rel="noreferrer" {...props}><Icon icon={icon}/>{ text }</a>);
  }
  else if (button){
    props.type = button;
    return (<button {...props}><Icon icon={icon}/>{ text }</button>);
  }
  else {
    return (<div {...props}><Icon icon={icon}/>{ text }</div>);
  }
});

const Icon = ({icon}) => {
  if (icon) return (<span><img className="defaultButtonIcon" src={`/images/icons/${icon}.svg`} alt="button icon" /></span> )
  return false;
}

export default DefaultButton;
