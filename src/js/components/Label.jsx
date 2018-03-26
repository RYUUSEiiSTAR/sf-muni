import React from 'react';

export default function Label(props) {
    let label = props.route.active ? "label" : "label disabled";
    return(
        <span className={label} onClick={() => props.onClick()}>
            {props.route.title}
        </span>
    );
}