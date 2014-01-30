module.exports = {
    "Inspection": {
        "id": "Inspection",
        "required": ["_id", "type"],
        "properties": {
            "_id": {
                "type": "string",
                "description": "unique identifier"
            },
            "type": {
                "type": "string",
                "description": "Type of inspection (Routine, Re-inspection)",
                "enum": [
                    "Routine",
                    "Re-inspection"
                ]
            },
            "date": {
                "type": "string",
                "description": "Date of inspection"
            }, "facilityId": {
                "type": "string",
                "description": "Unique identifier of the facility"
            }, "facility": {
                "type": "string",
                "description": "relative path to facility resource"
            },
            "violations": {
                "type": "array",
                "description": "List of violations",
                "items": {
                    "type": "Violation"
                }
            }
        }
    },
    "Violation": {
        "id": "Violation",
        "required": ["code"],
        "properties": {
            "code": {
                "type": "string",
                "description": "Code identifier"
            }, "text": {
                "type": "string",
                "description": "Code description"
            }, "response": {
                "type": "string",
                "description": "Facility response"
            }, "note": {
                "type": "string",
                "description": "Inspector comments"
            },
            "repeat": {
                "type": "boolean",
                "description": "Flag indicating if this is a repeat violation"
            }
        }},
    "Facility": {
        "id": "Facility",
        "required": ["_id"],
        "properties": {
            "_id": {
                "type": "string",
                "description": "Unique identifier"
            },
            "name": {
                "type": "string",
                "description": "facility name"
            },
            "phone": {
                "type": "string",
                "description": "phone number"
            },
            "street": {
                "type": "string",
                "description": "Street address"
            },
            "city": {
                "type": "string",
                "description": "city"
            },
            "inspections": {
                "type": "string",
                "description": "relative path to inspections resource"
            }
        }
    }
}

