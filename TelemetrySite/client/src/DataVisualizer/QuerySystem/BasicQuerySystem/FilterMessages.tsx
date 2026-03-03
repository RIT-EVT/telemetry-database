import { QueryFunctions } from "./BasicQueryDataTypes";
import { BuildURI } from "Utils/ServerUtils.ts";

import { Form } from "reactstrap";

const FilterMessages = ({ updateQueryStep, updateQueryDocument, currentDocId }: QueryFunctions) => {
    const auth_token = sessionStorage.getItem("authToken");

    const handleMessageFilterGet = async (response: Response) => {
        if (response.ok) {
        }
    };

    const handleSubmit = (e: React.FormEvent) => {};

    fetch(`${BuildURI("message_filter")}?doc_id=${currentDocId}&auth_token=${auth_token}`, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(handleMessageFilterGet);

    return <Form onSubmit={handleSubmit}></Form>;
};

export default FilterMessages;
