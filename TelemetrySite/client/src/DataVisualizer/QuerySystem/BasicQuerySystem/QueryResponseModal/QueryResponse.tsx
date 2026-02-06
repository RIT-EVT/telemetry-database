import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Collapse } from "reactstrap";
import { useState } from "react";
import "./QueryResponse.css";

type ResponseFormat = {
    count: number;
    events: [
        {
            name: string;
            date: string;
        },
    ];
};

type ResponseData = {
    matchFinal_Result: ResponseFormat;
    matchDate?: ResponseFormat;
    matchName?: ResponseFormat;
    matchLocation?: ResponseFormat;
};

type QueryResponseProps = {
    toggleModal: () => void;
    response: ResponseData | null;
};

const QueryResponse = ({ toggleModal, response }: QueryResponseProps) => {
    console.log(response);

    const [displayData, setDisplayData] = useState<[boolean]>([false]);

    if (!response) return;

    let responseKeys = Object.keys(response) as Array<keyof ResponseData>;
    let responseBody = responseKeys.map((objectKey: keyof ResponseData, index: number) => {
        const title = objectKey.replace("match", "").replace("_", " ");
        if (!objectKey) return;

        const currentData = response[objectKey];

        if (!currentData) return;
        if (displayData.length < index) {
            const dataBool = displayData;
            while (dataBool.length < index) dataBool.push(false);

            setDisplayData(dataBool);
        }
        return (
            <div key={index}>
                <div>
                    {title}{" "}
                    <Button
                        onClick={() => {
                            const dataBool = displayData;
                            dataBool[index] = !dataBool[index];

                            setDisplayData(dataBool);
                        }}
                    ></Button>
                </div>

                <Collapse isOpen={displayData[index] ? true : false}>
                    {currentData.events.map((event) => {
                        return event.name;
                    })}
                </Collapse>
            </div>
        );
    });

    return (
        <Modal isOpen={responseKeys.length !== 0} toggle={toggleModal} size='xl'>
            <ModalHeader toggle={toggleModal} className='background'>
                Query Test Result
            </ModalHeader>
            <ModalBody className='background'>{responseBody}</ModalBody>
            <ModalFooter className='background'>
                <Button color='danger' onClick={toggleModal}>
                    Exit
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export { QueryResponse };
export type { ResponseData };
