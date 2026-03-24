import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Collapse, Container, Table, Row, Col } from "reactstrap";
import { useState, useEffect, ReactElement } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./QueryResponse.css";
import { QueryResponseProps, QueryResponseResult, ResponseFormat, EventData } from "../BasicQueryDataTypes";

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

    const responseKeys = Object.keys(response.query_data) as Array<keyof QueryResponseResult>;
    const queryNameValidDisplay = (): ReactElement | null => {
        if (!response.query_name.name_passed) return null;

        return <Row>Query Response name</Row>;
    };
    return (
        <Modal className='white-border' isOpen={responseKeys.length !== 0} toggle={toggleModal} size='xl'>
            <ModalHeader className='background header'>Query Test Result</ModalHeader>

            <ModalBody className='background'>
                <Container>
                    <Col>
                        {queryNameValidDisplay()}
                        {responseKeys.map((objectKey, index) => {
                            const currentData = response.query_data[objectKey];
                            if (!currentData) return null;

                            const title = objectKey.replace("match", "").replace("_", " ");

                            return (
                                <Row key={objectKey}>
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
                                </Row>
                            );
                        })}
                    </Col>
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
