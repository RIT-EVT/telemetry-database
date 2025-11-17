import React from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    CardText,
    Button,
} from "reactstrap";

import "./Home.css";

const Home = () => {
    return (
        <Container className='mt-5'>
            {/* Welcome Header */}
            <Row className='mb-b'>
                <Col>
                    <h1>EVT Telemetry Portal</h1>
                    <p className='text-muted'>
                        Welcome to RIT EVT’s internal telemetry management
                        system. Upload, analyze, and document CAN data all in
                        one place.
                    </p>
                </Col>
            </Row>

            <Row className='g-4'>
                <Col md='4'>
                    {CreateCard(
                        "📤",
                        "Context Upload",
                        " Upload new telemetry data and automatically generate context for system-wide analysis.",
                        "/context-upload",
                        "Go to Upload"
                    )}
                </Col>

                <Col md='4'>
                    {CreateCard(
                        "📊",
                        "Data Access",
                        "Browse and query processed telemetry datasets. Visualize sensor data and inspect historical runs.",
                        "/data-access",
                        "Explore Data"
                    )}
                </Col>

                <Col md='4'>
                    {CreateCard(
                        "📚",
                        "Documentation",
                        "View internal API documentation, tool usage guides, and team workflow standards.",
                        "/docs",
                        "Read Docs"
                    )}
                </Col>
            </Row>

            <Row className='mt-5'>
                <Col>
                    <h3>Recent Activity</h3>
                    <p className='text-muted'>
                        Telemetry Database has no recent updates.
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

function CreateCard(icon, title, content, link, buttonContent) {
    return (
        <Card className='shadow-sm fill'>
            <CardBody>
                <CardTitle tag='h2' className='page-title'>
                    <div>{icon}</div>

                    {title}
                </CardTitle>
                <CardText className='body-text'>{content}</CardText>
                <Button className='button-link' color='primary' href={link}>
                    {buttonContent}
                </Button>
            </CardBody>
        </Card>
    );
}

export default Home;
