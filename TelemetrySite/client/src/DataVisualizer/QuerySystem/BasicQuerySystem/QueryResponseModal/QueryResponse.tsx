import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Collapse, Container, Table } from "reactstrap";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, XSquare } from "react-feather";
import "./QueryResponse.css";
import { QueryResponseProps, ResponseFormat, ResponseData, EventData } from "../BasicQueryDataTypes";

const QueryResponse = ({ toggleModal, response }: QueryResponseProps) => {
    const [displayData, setDisplayData] = useState<boolean[]>([]);

    const updateDataDisplay = (index: number) => {
        setDisplayData((prev) => prev.map((open, i) => (i === index ? !open : open)));
    };

    useEffect(() => {
        if (!response) return;
        const keys = Object.keys(response);
        setDisplayData(new Array(keys.length).fill(false));
    }, [response]);

    if (!response) return null;

    const responseKeys = Object.keys(response) as Array<keyof ResponseData>;

    return (
        <Modal className='white-border' isOpen={responseKeys.length !== 0} toggle={toggleModal} size='xl'>
            <ModalHeader
                toggle={toggleModal}
                close={
                    <button onClick={toggleModal}>
                        <XSquare />
                    </button>
                }
                className='background header'
            >
                Query Test Result
            </ModalHeader>

            <ModalBody className='background'>
                <Container>
                    {responseKeys.map((objectKey, index) => {
                        const currentData = response[objectKey];
                        if (!currentData) return null;

                        const title = objectKey.replace("match", "").replace("_", " ");

                        return (
                            <div key={objectKey}>
                                <div>
                                    <h6>
                                        {title}{" "}
                                        <Button className='no-background' onClick={() => updateDataDisplay(index)}>
                                            {displayData[index] ? (
                                                <ChevronUp color={"white"} />
                                            ) : (
                                                <ChevronDown color={"white"} />
                                            )}
                                        </Button>
                                    </h6>
                                </div>

                                <Collapse isOpen={!!displayData[index]}>{ConstructTable(currentData)}</Collapse>
                            </div>
                        );
                    })}
                </Container>
            </ModalBody>

            <ModalFooter className='background'>
                <Button color='danger' onClick={toggleModal}>
                    Exit
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const ConstructTable = (tableData: ResponseFormat) => {
    if (tableData.count === 0)
        return (
            <div className='no-runs-found'>
                <p>
                    <b>No Runs Found Matching This Criteria</b>
                </p>
            </div>
        );
    return (
        <Table className={"response-table"} hover>
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Event Location</th>
                    <th>Event Date</th>
                </tr>
            </thead>
            <tbody>
                {tableData.events.map((tableData: EventData) => {
                    return (
                        <tr>
                            <td>{tableData.name}</td>
                            <td>{tableData.location}</td>
                            <td>{tableData.date}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default QueryResponse;
