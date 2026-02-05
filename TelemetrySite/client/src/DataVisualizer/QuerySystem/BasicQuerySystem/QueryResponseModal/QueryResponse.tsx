import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "reactstrap";
import "./QueryResponse.css";

type QueryResponseProps = {
    toggleModal: () => void;
    title: string;
    response: object;
};

const QueryResponse = ({ toggleModal, title, response }: QueryResponseProps) => {
    console.log(response);
    return (
        <Modal isOpen={Object.keys(response).length !== 0} toggle={toggleModal}>
            <ModalHeader className='background'>{title}</ModalHeader>
            <ModalBody className='background'>{}</ModalBody>
            <ModalFooter className='background'>
                <Button onClick={toggleModal}></Button>
            </ModalFooter>
        </Modal>
    );
};

export default QueryResponse;
