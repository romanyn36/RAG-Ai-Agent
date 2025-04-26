import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';

function Message({ variant, children }) {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <Alert variant={variant} onClose={() => setShow(false)} dismissible>
            {children}
        </Alert>
    );
}

export default Message;
