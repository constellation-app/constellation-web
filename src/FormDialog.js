import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function FormDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const setTextValue = (event) => {
        setValue(event.target.value);
        props.onClick();
    }

    var handleToUpdate = props.handleToUpdate;

    return (
        <div>
            <Button style={{ backgroundColor: '#e7e7e7', fontSize: '8pt', padding: '0px' }} variant="outlined" color="primary" onClick={handleClickOpen}>
                Edit
      </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle variant="body2" id="form-dialog-title">Edit Attribute: {props.label}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a new value to submit.
          </DialogContentText>
                    <TextField
                        onChange={setTextValue}
                        autoFocus
                        margin="dense"
                        id="Value"
                        label="Value"
                        type="text"
                        fullWidth
                        defaultValue={props.current}
                    />
                </DialogContent>
                <DialogActions>
                    <Button style={{ backgroundColor: '#e7e7e7', fontSize: '8pt', padding: '0px' }} variant="outlined" color="primary" onClick={handleClose}>
                        Cancel
          </Button>
                    <Button style={{ backgroundColor: '#e7e7e7', fontSize: '8pt', padding: '0px' }} variant="outlined" color="primary" onClick={() => {handleToUpdate(value); setOpen(false);}}>
                        Save
          </Button>

                </DialogActions>
            </Dialog>
        </div>
    );
}
