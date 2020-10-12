import React from 'react';
import Button from '@material-ui/core/Button';

import './MenuButton.css'

function MenuButton(props) {
    return (
        <Button className="menuButton" 
                size="small" 
                variant="contained" 
                onClick={props.onClick}
        >
            {props.buttonName}
        </Button>
    );
}

export default MenuButton;