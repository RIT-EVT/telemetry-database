import { useState, } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

function ErrorModal(props) {
    const [isErrorModalActive, setErrorModal] = useState(true);
    const ModalErrorToggle = () => {
        console.log("switching to", !isErrorModalActive);
        setErrorModal(!isErrorModalActive);
        console.log("after update. ", isErrorModalActive);
    };
    if (props.error == null) {
        return ;
    }
    return (
        <div>
            <Modal isOpen={isErrorModalActive} toggle={ModalErrorToggle} >
                <ModalHeader toggle={ModalErrorToggle}>
                    ERROR
                </ModalHeader>
                <ModalBody>
                    {props.error.message}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={ModalErrorToggle}>
                        Acknowledge
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default ErrorModal;