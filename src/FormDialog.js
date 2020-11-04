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
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                Edit
      </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Edit Value</DialogTitle>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={() => handleToUpdate(value)} color="primary">
                        Save Edit
          </Button>

                </DialogActions>
            </Dialog>
        </div>
    );
}
