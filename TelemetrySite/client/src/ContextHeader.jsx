import { Button } from "reactstrap";
import React, { useCallback, useEffect, useState } from "react";
import "./ContextHeader.css";
import ContextForm from "./contextForm/ContextForm.jsx";

function ContextHeader() {
  const handleClick = useCallback(() => {
    console.log("Button clicked!");
  }, []);

  const displayModeEnum = Object.freeze({
    BASE_MODE: 0,
    NEW_CONTEXT: 1,
    EXISTING_CONTEXT: 2,
  });

  const [body, updateBody] = useState(null);
  const [displayMode, updateDisplayMode] = useState(displayModeEnum.BASE_MODE);

  /**
   * Set the display mode for the body on button click
   * If the display mode is the same as the current mode
   * Set to base display
   * @param {displayModeEnum} newDisplayMode - display mode to set to
   */
  const ButtonDisplayClicked = (newDisplayMode) => {
    //if the button clicked was the same as the
    //current mode, return to default
    //else set to new mode
    if (displayMode == newDisplayMode) {
      updateDisplayMode(displayModeEnum.BASE_MODE);
    } else {
      updateDisplayMode(newDisplayMode);
    }
  };

  const ButtonsForSelect = (
    <div className="ButtonDisplayBody">
      <table>
        <tbody>
          <tr>
            <td>
              <center>
                <Button
                  className="ButtonBody"
                  onClick={() => {
                    ButtonDisplayClicked(displayModeEnum.NEW_CONTEXT);
                  }}
                >
                  New Context
                </Button>
              </center>
            </td>
            <td>
              <center>
                <Button
                  className="ButtonBody"
                  onClick={() => {
                    ButtonDisplayClicked(displayModeEnum.EXISTING_CONTEXT);
                  }}
                >
                  Existing Context
                </Button>
              </center>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  var setMode;
  useEffect(() => {
    var bodyContent;
    if (setMode === displayMode) {
      return;
    } else {
      setMode = displayMode;
    }
    switch (displayMode) {
      case displayModeEnum.BASE_MODE:
        //display an welcome/prompt screen
        bodyContent = <div>I'm empty</div>;
        break;

      case displayModeEnum.NEW_CONTEXT:
        //display a the base input fields
        bodyContent = <ContextForm getExistingContext={false} />;
        break;

      case displayModeEnum.EXISTING_CONTEXT:
        //prompt user for which context file they want
        bodyContent = <ContextForm getExistingContext={true} />;
        break;
    }

    updateBody(bodyContent);
  }, [displayMode]);

  return (
    <div className="MainBody">
      <div className="ContextSelect">
        <header className="ContextHeader">
          <center>
            <div className="ContextHeaderText">Context Creator</div>
          </center>
        </header>

        {ButtonsForSelect}
      </div>
      {body}
    </div>
  );
}

export default ContextHeader;
