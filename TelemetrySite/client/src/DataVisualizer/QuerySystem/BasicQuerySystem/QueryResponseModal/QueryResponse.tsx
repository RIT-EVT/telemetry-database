import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Collapse, Container, Table, Row, Col } from "reactstrap";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./QueryResponse.css";
import { QueryResponseProps, QueryResponseResult, ResponseFormat, EventData } from "../BasicQueryDataTypes";

const QueryResponse = ({ toggleModal, response }: QueryResponseProps) => {
    const [displayData, setDisplayData] = useState<boolean[]>([]);
    const [displayQueryNameResponse, setQueryNameDisplay] = useState<boolean>(false);

    const responseKeys = response ? (Object.keys(response.query_data) as Array<keyof QueryResponseResult>) : [];

    const updateDataDisplay = (index: number) => {
        setDisplayData((prev) => prev.map((open, i) => (i === index ? !open : open)));
    };

    const updateQueryNameDisplay = () => {
        setQueryNameDisplay(!displayQueryNameResponse);
    };

    useEffect(() => {
        if (!response) return;
        setDisplayData(new Array(responseKeys.length).fill(false));
    }, [response]);

    if (!response) return null;

    const { name_passed, name_valid, name } = response.query_name;

    return (
        <Modal className="white-border" isOpen={responseKeys.length !== 0} toggle={toggleModal} size="xl">
            <ModalHeader className="background header">Query Test Result</ModalHeader>

            <ModalBody className="background">
                <Container>
                    <Col>
                        {responseKeys.map((objectKey, index) => {
                            const currentData = response.query_data[objectKey];
                            if (!currentData) return null;

                            const title = objectKey.replace("match", "").replace("_", " ");

                            return (
                                <Row key={objectKey}>
                                    <div>
                                        <h6>
                                            {title}{" "}
                                            <Button className="no-background" onClick={() => updateDataDisplay(index)}>
                                                {displayData[index] ? (
                                                    <ChevronUp color={"white"} />
                                                ) : (
                                                    <ChevronDown color={"white"} />
                                                )}
                                            </Button>
                                        </h6>
                                    </div>
                                    {/* The below !!displayData[index] is not an error. The first ! makes it a boolean then !! reverts it */}
                                    <Collapse isOpen={!!displayData[index]}>{ConstructTable(currentData)}</Collapse>
                                </Row>
                            );
                        })}

                        {name_passed && (
                            <Row className="mx-0 white">
                                <h6 className="px-0">
                                    Query Name{" "}
                                    <Button className="no-background" onClick={updateQueryNameDisplay}>
                                        {displayQueryNameResponse ? (
                                            <ChevronUp color={"white"} />
                                        ) : (
                                            <ChevronDown color={"white"} />
                                        )}
                                    </Button>
                                </h6>
                                <Collapse isOpen={displayQueryNameResponse}>
                                    <p className="px-0">
                                        <strong>{name}</strong> —
                                        {name_valid ? (
                                            <span className="text-success">Valid.</span>
                                        ) : (
                                            <span className="text-danger">Invalid. Name already in use.</span>
                                        )}
                                    </p>
                                </Collapse>
                            </Row>
                        )}
                    </Col>
                </Container>
            </ModalBody>

            <ModalFooter className="background">
                <Button color="danger" onClick={toggleModal}>
                    Exit
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const ConstructTable = (tableData: ResponseFormat) => {
    if (tableData.count === 0)
        return (
            <div className="no-runs-found">
                <p>
                    <b>No Runs Found Matching This Criteria</b>
                </p>
            </div>
        );

    return (
        <Table className="response-table" hover>
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Event Location</th>
                    <th>Event Date</th>
                </tr>
            </thead>
            <tbody>
                {/* Fix: add key prop to <tr> */}
                {tableData.events.map((event: EventData) => (
                    <tr key={`${event.name}-${event.date}`}>
                        <td>{event.name}</td>
                        <td>{event.location}</td>
                        <td>{event.date}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default QueryResponse;
