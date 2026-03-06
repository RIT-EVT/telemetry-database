import { QueryFunctions } from "./BasicQueryDataTypes";
import { BuildURI } from "Utils/ServerUtils.ts";

const FilterMessages = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    const auth_token = sessionStorage.getItem("authToken");

    const handleMessageFilterGet = async (response: Response) => {
        if (response.ok) {
        }
    };

    const handleSubmit = (e: React.FormEvent) => {};

    setHandleSubmit(handleSubmit);

    fetch(`${BuildURI("message_filter")}?doc_id=${currentDocId}&auth_token=${auth_token}`, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(handleMessageFilterGet);

    return <div></div>;
};

export default FilterMessages;
