import os.path
from datetime import datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar"]
TOKEN_FILE = "token.json"
CREDENTIAL_FILE = "credentials.json"


class GoogleCalendar:
    service: Resource = None
    credential = None

    def __init__(self):
        self.credential = None
        if os.path.exists(TOKEN_FILE):
            credential = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        if not credential or not credential.valid:
            if credential and credential.expired and credential.refresh_token:
                credential.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIAL_FILE, SCOPES
                )
                credential = flow.run_local_server(port=8080)
            with open(TOKEN_FILE, "w") as token:
                token.write(credential.to_json())
            self.credential = credential

        self.service = build("calendar", "v3", credentials=credential)

    def get_events(
        self, calendar_id="primary", time_min: datetime = None, max_results=10
    ):
        now = datetime.now()
        time_min = time_min or now
        time_min = time_min.isoformat() + "Z"

        print(f"Getting the upcoming {max_results} events")
        events_result = (
            self.service.events()
            .list(
                calendarId=calendar_id,
                timeMin=time_min,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])
        print(events)
        return events

    def create_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        calendar_id="primary",
        description: str = None,
        attendees: list = None,
        location: str = None,
    ):
        event = {
            "summary": summary,
            "start": {
                "dateTime": start_time.isoformat(),
                "timeZone": "America/Los_Angeles",
            },
            "end": {
                "dateTime": end_time.isoformat(),
                "timeZone": "America/Los_Angeles",
            },
            "location": location,
            "description": description,
            "attendees": attendees,
        }
        event = self.service.events().insert(calendarId="primary", body=event).execute()
        print(f"Event created: {event.get('htmlLink')}")
        return event

    def delete_event(self, event_id, calendar_id="primary"):
        self.service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        print(f"Event deleted: {event_id}")


def print_event(event):
    start = event["start"].get("dateTime", event["start"].get("date"))
    print(start, event["summary"])


def main():
    try:
        google_calendar = GoogleCalendar()
        events = google_calendar.get_events()
        if not events:
            print("No upcoming events found.")
            return
        for event in events:
            print_event(event)

        # Create an event
        start_time = datetime.now()
        end_time = start_time.replace(hour=start_time.hour + 1)
        google_calendar.create_event(
            summary="Test Event",
            start_time=start_time,
            end_time=end_time,
            description="This is a test event",
        )
        # Get the events again
        events = google_calendar.get_events()
        if not events:
            print("No upcoming events found.")
            return
        for event in events:
            print_event(event)

        # Delete the event
        test_event_ids = [
            event["id"] for event in events if event["summary"] == "Test Event"
        ]
        for event_id in test_event_ids:
            google_calendar.delete_event(event_id)
        # Get the events again
        events = google_calendar.get_events()
        if not events:
            print("No upcoming events found.")
            return
        for event in events:
            print_event(event)

    except HttpError as error:
        print(f"An error occurred: {error}")


if __name__ == "__main__":
    main()
