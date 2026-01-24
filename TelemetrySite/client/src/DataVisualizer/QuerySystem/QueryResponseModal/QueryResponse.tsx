import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "reactstrap";
import "./QueryResponse.css";

type QueryResponseProps = {
    isOpen: boolean;
    toggleModal: () => void;
    title: string;
};

const QueryResponse = ({ isOpen, toggleModal, title }: QueryResponseProps) => {
    return (
        <Modal isOpen={isOpen} toggle={toggleModal}>
            <ModalHeader className='background'>
                <h1>{title}</h1>
            </ModalHeader>
            <ModalBody className='background'>{/* response content */}</ModalBody>
            <ModalFooter className='background'>
                <Button onClick={toggleModal}></Button>
            </ModalFooter>
        </Modal>
    );
};

export default QueryResponse;
