import { Alert, AlertTitle } from "@mui/material"
import Collapse from '@mui/material/Collapse';

/**
 * A component for a error message
 * @prop showError: a bolean which defines whether or not an error is shown
 * @prop setShowError: sets the showError variable
 * @prop title: title of the error
 * @prop message: message of the error
 * @returns a JSX alert component showing an error has occured
 */
export function ErrorBox({showError, setShowError, title, message}) {
    return (
        <div className="errorBox">
            <Collapse in={showError}>
                <Alert onClose={() => {setShowError(false)}} severity="error" variant="filled">
                    <AlertTitle><b>{title}</b></AlertTitle>
                    {message}
                </Alert>
            </Collapse>
        </div>
    )
}