import React from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from 'reactstrap';

const ErrorModal = ({ isOpen, toggle, ignore, errorMessage }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>Error</ModalHeader>
            <ModalBody>
                {errorMessage || 'An unexpected error occurred.'}
            </ModalBody>
            <ModalFooter>
                {ignore && (
                    <Button color="warning" onClick={ignore}>
                        Ignore
                    </Button>
                )}
                <Button color="danger" onClick={toggle}>
                    Close
                </Button>

            </ModalFooter>
        </Modal>
    );
};

export default ErrorModal;