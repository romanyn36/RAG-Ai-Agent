import Spinner from 'react-bootstrap/Spinner';

function Loader({size=100}) {
    return (
        <div>
            <Spinner animation="border" variant="" role='status'
            className='d-block m-auto'
            style={{height:`${size}px`,
                width:`${size}px`
            }}
            >
            </Spinner>

            {/* <Spinner animation="grow" variant="dark" /> */}
        </div>
    );
}

export default Loader;