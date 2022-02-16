import React, { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

const DefaultButton = forwardRef(({
  id,
  className,
  text,
  navlink, href, button,
  bordered, inverted, shadowless,
  onClick,
  icon, reversed,
}, ref) => {
  const borderedClass = (bordered) ? "is-bordered" : "";
  const invertedClass = (inverted) ? "is-inverted" : "";
  const shadowlessClass = (shadowless) ? "is-shadowless" : "";
  const reversedClass = (reversed) ? "is-reversed" : "";

  const props = {
    id: id,
    className: `defaultButton noselect ${invertedClass} ${borderedClass} ${reversedClass} ${shadowlessClass} ${className}`,
    onClick: onClick,
    ref: ref,
  }

  const iconTextProps = {
    text: text,
    icon: icon,
    reversed: reversed
  }

  //a tag, navlink, or div tag
  if (navlink){
    props.to = navlink;
    return (<NavLink {...props}><IconText {...iconTextProps} /></NavLink>);
  }
  else if (href){
    props.href = href;
    return (<a target="_blank" rel="noreferrer" {...props}><IconText {...iconTextProps} /></a>);
  }
  else if (button){
    props.type = button;
    return (<button {...props}><IconText {...iconTextProps} /></button>);
  }
  else {
    return (<div {...props}><IconText {...iconTextProps} /></div>);
  }
});

const Icon = ({icon}) => {
  if (icon) return (<span><img className="defaultButtonIcon" src={`/images/icons/${icon}.svg`} alt="button icon" /></span> )
  return false;
}

const IconText = ({text, icon, reversed}) => {
  if (reversed) return (<>{ text }<Icon icon={icon}/></>);
  else return (<><Icon icon={icon}/>{ text }</>);
}

export default DefaultButton;
