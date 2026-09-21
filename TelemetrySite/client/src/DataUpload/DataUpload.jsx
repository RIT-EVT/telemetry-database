import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardBody, Col, Container, Form, Input, Row } from "reactstrap";

import "./DataUpload.css";
import {
    BuildURI,
    CheckData,
    getRunOrderNumber,
    incrementRunOrderNumber,
    resetRunOrderNumber,
} from "../Utils/ServerUtils.ts";
import { getItem, removeItem, saveItem } from "../Utils/SessionStorageLoader.ts";

const POLL_INTERVAL_MS = 1000;
const FINISHED = "Finished";

const STATUS = {
    IDLE: "idle", // showing the upload form
    UPLOADING: "uploading", // request in flight, progress bar visible
    DONE: "done", // upload finished, showing "New Run" / "New Context"
};

/* -------------------------------------------------------------------------- */
/*  Backend helpers (no React state in here)                                  */
/* -------------------------------------------------------------------------- */

const uploadUrl = () => `${BuildURI("data_upload")}/${getItem("authToken")}`;

/**
 * POST the form data to the backend.
 * @param {FormData} formData
 * @returns {Promise<boolean>} true on success
 */
async function postDataFile(formData) {
    try {
        const authResponse = await CheckData();
        if (!authResponse) {
            // TODO: the original called `authResponse.json()` here, which always threw
            // on a falsy value, so the "authError -> /login" redirect never ran.
            // Once it's clear what CheckData() returns on failure, restore that redirect.
            console.error("CheckData failed");
            return false;
        }

        const response = await fetch(uploadUrl(), { method: "POST", body: formData });

        if (!response.ok) {
            const { error } = await response.json();
            console.error("Error occurred on server side. Error message: " + error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Network or server error:", error);
        return false;
    }
}

/**
 * Fetch the progress of the current upload.
 * The backend responds with `{ "<stage label>": <0..1> }`, or `{ "Finished": ... }`.
 * @returns {Promise<object>} progress payload, or `{ error }` on failure
 */
async function fetchProgress() {
    try {
        const response = await fetch(uploadUrl(), { method: "GET" });
        if (!response.ok) {
            return { error: response.statusText };
        }
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

/** Persist the event details so the next page can display them. */
function saveEventData({ event }) {
    saveItem(
        "EventData",
        JSON.stringify({
            eventName: event.name,
            eventDate: event.date,
            eventType: event.type,
            eventLocation: event.location,
        }),
    );
}

/* -------------------------------------------------------------------------- */
/*  Presentational components                                                 */
/* -------------------------------------------------------------------------- */

function FileField({ label, name, accept }) {
    return (
        <Col>
            <h4 className='mb-3'>{label}</h4>
            <Input type='file' name={name} className='file-input' required accept={accept} bsSize='sm' />
        </Col>
    );
}

function UploadForm({ onSubmit, isNewRun, error }) {
    return (
        <Form className='DataUploadForm' onSubmit={onSubmit} encType='multipart/form-data'>
            <Container>
                {error && <Alert color='danger'>{error}</Alert>}
                <Row>
                    <FileField label='Upload MF4 File' name='mf4File' accept='.mf4' />
                    <FileField label='Upload DBC File' name='dbcFile' accept='.dbc' />
                </Row>
            </Container>
            <Button type='submit' className='submit-btn'>
                Submit {isNewRun ? "Run" : null}
            </Button>
        </Form>
    );
}

function UploadProgress({ progress }) {
    if (!progress) return null;

    return (
        <Container>
            <Col>
                <Row>
                    <progress value={progress.value} />
                    <div className='response'>
                        {progress.label} : {Math.round(progress.value * 100)}%
                    </div>
                </Row>
            </Col>
        </Container>
    );
}

function RedirectButtons({ onNewRun, onNewContext }) {
    return (
        <Container className='button-container'>
            <Row>
                <Col>
                    <Button className='redirectButton' onClick={onNewRun}>
                        New Run
                    </Button>
                </Col>
                <Col>
                    <Button className='redirectButton' onClick={onNewContext}>
                        New Context
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Upload an mf4 file and a dbc file to the backend server, together with the
 * context data saved in session storage. All file authentication is done on
 * the backend.
 */
function DataUpload() {
    const navigate = useNavigate();

    // Starting in DONE means a page refresh won't let the user resubmit the same data.
    const [status, setStatus] = useState(() => (getItem("DataSubmitted") ? STATUS.DONE : STATUS.IDLE));
    const [progress, setProgress] = useState(null); // { label, value }
    const [error, setError] = useState(null);

    /**
     * While an upload is in flight, poll the backend for progress.
     * Uses chained timeouts (not setInterval) so requests never overlap,
     * and the cleanup guarantees nothing updates state after we stop caring.
     */
    useEffect(() => {
        if (status !== STATUS.UPLOADING) return;

        let cancelled = false;
        let timeoutId;

        const poll = async () => {
            const data = await fetchProgress();
            if (cancelled) return;

            if (data.error) {
                console.error("Error fetching progress:", data.error);
            } else {
                const [label] = Object.keys(data);
                if (label === FINISHED) return; // stop polling; the POST response ends the upload state

                setProgress({ label, value: data[label] });
            }

            timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        };

        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [status]);

    /**
     * Send the selected files plus the context data to the backend.
     * @param {React.FormEvent<HTMLFormElement>} event
     */
    async function handleSubmit(event) {
        event.preventDefault();

        const contextData = getItem("BikeData");
        if (!contextData) {
            console.error("No data from context saved");
            setError("No context data found. Create a context before uploading a run.");
            return;
        }

        // The file inputs are named "mf4File" and "dbcFile", so FormData picks them up directly.
        const formData = new FormData(event.currentTarget);
        formData.append("contextData", JSON.stringify(contextData));
        formData.append("runOrderNumber", getRunOrderNumber());

        setError(null);
        setProgress(null);
        setStatus(STATUS.UPLOADING);

        const success = await postDataFile(formData);

        if (!success) {
            setStatus(STATUS.IDLE);
            setError("The upload failed. Check your files and try again.");
            return;
        }

        incrementRunOrderNumber();
        saveItem("DataSubmitted", true);
        saveEventData(contextData);

        setProgress(null);
        setStatus(STATUS.DONE);
    }

    /**
     * Leave this page. Clears the submitted flag and bike data so the
     * next upload starts fresh.
     * @param {string} url
     */
    function redirectTo(url) {
        saveItem("DataSubmitted", false);
        removeItem("BikeData");
        navigate(url);
    }

    const handleNewRun = () => redirectTo("/new-run");

    const handleNewContext = () => {
        removeItem("EventData");
        resetRunOrderNumber();
        redirectTo("/context-upload");
    };

    return (
        <Container fluid className='outer-container'>
            <Card className='upload-card'>
                <CardBody className='text-center'>
                    {status === STATUS.IDLE && (
                        <UploadForm onSubmit={handleSubmit} isNewRun={Boolean(getItem("EventData"))} error={error} />
                    )}

                    {status === STATUS.UPLOADING && (
                        <center>
                            <UploadProgress progress={progress} />
                        </center>
                    )}

                    {status === STATUS.DONE && <RedirectButtons onNewRun={handleNewRun} onNewContext={handleNewContext} />}
                </CardBody>
            </Card>
        </Container>
    );
}

export default DataUpload;
