import { useEffect, useState } from "react";

import "./DataUpload.css";
import {
    BuildURI,
    CheckData,
    getRunOrderNumber,
    incrementRunOrderNumber,
    resetRunOrderNumber,
} from "../Utils/ServerUtils.jsx";
import { Container, Col, Row, Card, CardBody, Input, Button, Form } from "reactstrap";
import { useNavigate } from "react-router-dom";

/**
 * Upload a mf4 file to the backend sever as
 * well as the context id passed through the url.
 * All file authentications are conducted on the backend
 */
function DataUpload() {
    const [bodyDisplay, setBodyDisplay] = useState(null);

    const [progressBar, setProgressBar] = useState(null);

    let navigate = useNavigate();

    /**
     * Set the path to redirect the user to. User can choose
     * to create a new context or a new run with the same event
     * @param {string} url - url to redirect the user to
     */
    function RedirectToContext(url) {
        sessionStorage.setItem("DataSubmitted", false);
        sessionStorage.removeItem("BikeData");
        navigate(url);
    }

    function DisplayRedirect() {
        setBodyDisplay(
            <Container className='button-container'>
                <Row>
                    <Col>
                        <Button
                            className='redirectButton'
                            onClick={() => {
                                RedirectToContext("/new-run");
                            }}
                        >
                            New Run
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            className='redirectButton'
                            onClick={() => {
                                sessionStorage.removeItem("EventData");
                                resetRunOrderNumber();
                                RedirectToContext("/context-form");
                            }}
                        >
                            New Context
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Submit the current file selected by the user.
     * Send the context id with the file to the back
     * end, then start the progress bar and wait for
     * the response from the backend
     *
     * @param {Event} event -Event details from the form
     */
    async function SubmitFile(event) {
        event.preventDefault(); // Prevent page reload
        const contextData = sessionStorage.getItem("BikeData");

        if (!contextData) {
            console.error("No data from context saved");
            return;
        }

        const PostDataFile = async (mf4File, dbcFile, contextData, runOrderNumber) => {
            // Ensure CheckData() completes before proceeding

            try {
                const response = await CheckData(); // Await the result
                if (!response) {
                    const responseJson = await response.json();
                    if ("authError" in responseJson) {
                        navigate("/login");
                    } else {
                        console.error(response.statusText);
                    }
                    return;
                }
            } catch (error) {
                console.error("Error in CheckData:", error);
                return false;
            }
            const formData = new FormData();
            formData.append("mf4File", mf4File);
            formData.append("dbcFile", dbcFile);
            formData.append("contextData", contextData);
            formData.append("runOrderNumber", runOrderNumber);

            try {
                const response = await fetch(BuildURI("data_upload") + "/" + sessionStorage.getItem("authToken"), {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const jsonResponse = await response.json();
                    console.error("Error occurred on server side. Error message: " + jsonResponse.error);
                    return false;
                }
                incrementRunOrderNumber();

                return await response.json();
            } catch (error) {
                console.error("Network or server error:", error);
                return false;
            }
        };

        const mf4File = document.getElementById("fileUploadMF4").files[0];
        const dbcFile = document.getElementById("fileUploadDBC").files[0];

        const postDataResponse = PostDataFile(mf4File, dbcFile, contextData, getRunOrderNumber());

        /**
         * Fetch the progress of the current upload
         *
         * @return {int} decimal of how much has been uploaded
         */
        const FetchProgress = async () => {
            try {
                const fetchProgressResponse = await fetch(
                    BuildURI("data_upload") + "/" + sessionStorage.getItem("authToken"),
                    {
                        method: "GET",
                    }
                );

                if (!fetchProgressResponse.ok) {
                    console.error("Network response was not ok: " + fetchProgressResponse.statusText);
                }

                const data = await fetchProgressResponse.json();

                return data;
            } catch (error) {
                console.error("Failed to fetch progress:", error);
                return { error: error.message };
            }
        };

        var lastProgress = -1;
        var lastResponseString = "";
        setBodyDisplay(null);
        var dataSubmitted = false;
        /**
         * Create an interval to update the progress bar every
         * second. Call to the backend and fetch the value
         * based off the context id and update the
         */
        const interval = setInterval(async () => {
            const data = await FetchProgress();

            if (data.error) {
                console.error("Error fetching progress:", data.error);
                return;
            }

            //get the progress passed from the backend
            const responseString = Object.keys(data)[0];

            if (responseString !== "Finished") {
                const currentProgress = data[responseString];
                if (currentProgress > lastProgress || currentProgress < 0 || responseString !== lastResponseString) {
                    // Update the UI with the formatted estimated time remaining
                    if (!dataSubmitted) {
                        setProgressBar(
                            <Container>
                                <Col>
                                    <Row>
                                        <progress value={currentProgress} />
                                        <div className='response'>
                                            {responseString} : {Math.round(currentProgress * 100)}%
                                        </div>
                                    </Row>
                                </Col>
                            </Container>
                        );
                    } else {
                        clearInterval(interval);
                    }
                    lastProgress = currentProgress;
                    lastResponseString = responseString;
                }
            } else {
                //stop calling to the backend
                clearInterval(interval);
                //clearing the bar is done when back end responds to submitting data
            }
        }, 1000);

        /**
         * When the backend responds, display buttons
         * to bring the user back to the context page
         * with the option of keeping the same event data
         */
        postDataResponse.then((responseValue) => {
            if (responseValue !== false) {
                dataSubmitted = true;
                sessionStorage.setItem("DataSubmitted", true);

                clearInterval(interval);
                setProgressBar(null);

                const parsedContextData = JSON.parse(contextData);

                //save the needed event details to be displayed on the next page
                const eventObject = {
                    eventName: parsedContextData["event"]["name"],
                    eventDate: parsedContextData.event.date,
                    eventType: parsedContextData.event.type,
                    eventLocation: parsedContextData.event.location,
                };

                sessionStorage.setItem("EventData", JSON.stringify(eventObject));

                DisplayRedirect();
            }
        });
    }

    useEffect(() => {
        //make sure a refresh doesn't make the user resubmit data

        if (sessionStorage.getItem("DataSubmitted") !== null && sessionStorage.getItem("DataSubmitted") === "true") {
            DisplayRedirect();
        } else {
            setBodyDisplay(
                <Form className='DataUploadForm' onSubmit={SubmitFile} encType='multipart/form-data'>
                    <Container>
                        <Row>
                            <Col>
                                <h4 className='mb-3'>Upload MF4 File</h4>
                                <Input
                                    type='file'
                                    id='fileUploadMF4'
                                    className='file-input'
                                    required
                                    accept='.mf4'
                                    bsSize='sm'
                                />
                            </Col>
                            <Col>
                                <h4 className='mb-3'>Upload DBC File</h4>
                                <Input
                                    type='file'
                                    id='fileUploadDBC'
                                    className='file-input'
                                    required
                                    accept='.dbc'
                                    bsSize='sm'
                                />
                            </Col>
                        </Row>
                    </Container>
                    <Button className='submit-btn'>Submit {sessionStorage.getItem("EventData") ? "Run" : null}</Button>
                </Form>
            );
        }
    }, []);

    return (
        <Container fluid className='outer-container'>
            <Card className='upload-card'>
                <CardBody fluid className='text-center'>
                    {bodyDisplay}
                    <center>{progressBar}</center>
                </CardBody>
            </Card>
        </Container>
    );
}

export default DataUpload;
