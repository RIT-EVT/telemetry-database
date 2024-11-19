from flask.views import MethodView
from flask import request, jsonify

import utils


class EventApi(MethodView):

    def get(self, contextId):

        sql_getEventId = "SELECT eventID FROM Context WHERE id = %s"

        eventId = utils.exec_get_one(sql_getEventId, (contextId,))[0]

        sql_getEventData = "SELECT * FROM event WHERE id = %s"

        eventData = utils.exec_get_one(sql_getEventData, (eventId,))

        return jsonify(
            {
                "id": eventData[0],
                "date": eventData[1],
                "eventType": eventData[2],
                "location": eventData[3],
            }
        )
