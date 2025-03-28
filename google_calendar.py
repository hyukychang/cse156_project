import os.path
import re
from datetime import datetime, timedelta

import inflect
import pytz
from dateutil import parser
from dateutil.relativedelta import FR, MO, SA, SU, TH, TU, WE, relativedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError


class GoogleCalendar:
    service: Resource = None
    credential = None

    SCOPES = ["https://www.googleapis.com/auth/calendar"]
    TOKEN_FILE = "token.json"
    CREDENTIAL_FILE = "credentials.json"

    AMERICA_LOS_ANGELES_TZ = "-08:00"

    def __init__(self):
        self.credential = None
        credential = None
        if os.path.exists(self.TOKEN_FILE):
            credential = Credentials.from_authorized_user_file(
                self.TOKEN_FILE, self.SCOPES
            )
        if not credential or not credential.valid:
            if credential and credential.expired and credential.refresh_token:
                credential.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.CREDENTIAL_FILE,
                    self.SCOPES,
                )
                # flow.authorization_url()
                authorization_url, state = flow.authorization_url(
                    # Enable offline access so that you can refresh an access token without
                    # re-prompting the user for permission. Recommended for web server apps.
                    access_type="offline",
                    # Enable incremental authorization. Recommended as a best practice.
                    include_granted_scopes="true",
                )
                credential = flow.run_local_server(
                    port=8080, access_type="offline", prompt="consent"
                )
            with open(self.TOKEN_FILE, "w") as token:
                token.write(credential.to_json())
            self.credential = credential

        self.service = build("calendar", "v3", credentials=credential)

    # booking appintment
    # * BookingAppointment - name (model), time (model), email, appointment type (model), Handle conflicts
    # * RescheduleAppointment - name (model), time (model), email, appointment type (model)
    # * CheckAvailability - name (model), time (model), email, appointment type (model)
    # * CancelAppointment - name (model), time (model), email, appointment type (model)
    # "2025-02-27
    # time format pm/am ->
    # input : starttime -> endtime + 1 hour

    def _get_events(
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

    # def _is_available_at_time(self, start_time: datetime, end_time: datetime) -> bool:
    #     events_result = (
    #         self.service.events()
    #         .list(
    #             calendarId="primary",
    #             timeMin=start_time.isoformat() + self.AMERICA_LOS_ANGELES_TZ,
    #             timeMax=end_time.isoformat() + self.AMERICA_LOS_ANGELES_TZ,
    #             maxResults=10,
    #             singleEvents=True,
    #             orderBy="startTime",
    #             timeZone="America/Los_Angeles",
    #         )
    #         .execute()
    #     )
    #     events = events_result.get("items", [])
    #     print("events", events)
    #     return len(events) == 0



    def _is_available_at_time(self, start_time: datetime, end_time: datetime) -> bool:
        # Ensure start_time and end_time are timezone-aware
        pacific_tz = pytz.timezone("America/Los_Angeles")
        start_time = start_time.astimezone(pacific_tz)
        end_time = end_time.astimezone(pacific_tz)

        events_result = (
            self.service.events()
            .list(
                calendarId="primary",
                timeMin=start_time.isoformat(),
                timeMax=end_time.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        events = events_result.get("items", [])
        print("events:", events)  # Debugging statement, remove in production
        return len(events) == 0

    def _create_event(
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

    def _delete_event(self, event_id, calendar_id="primary"):
        self.service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        print(f"Event deleted: {event_id}")

    def _get_events_with_attendee_email_n_prev_time(
        self,
        user_email: str,
        min_time: datetime,
        calendar_id="primary",
    ) -> str:
        """
        return the event id, time, summary of the events with the given user_email
        """

        events_result = (
            self.service.events()
            .list(
                calendarId=calendar_id,
                timeMin=min_time.isoformat() + self.AMERICA_LOS_ANGELES_TZ,
                singleEvents=True,
                maxResults=10,
                orderBy="startTime",
                q=user_email,
            )
            .execute()
        )

        return [
            {
                "id": event["id"],
                "start": event["start"],
                "end": event["end"],
                "summary": event["summary"],
            }
            for event in events_result.get("items", [])
        ]

    def _parse_date(self, date_str: str) -> tuple[str, bool]:
        today: datetime = datetime.today()

        days_map = {
            "monday": MO,
            "tuesday": TU,
            "wednesday": WE,
            "thursday": TH,
            "friday": FR,
            "saturday": SA,
            "sunday": SU,
        }

        date_str = date_str.lower().strip()

        if date_str == "today":
            return today.strftime("%Y-%m-%d"), True

        if date_str == "tomorrow":
            return (today + timedelta(days=1)).strftime("%Y-%m-%d"), True

        if date_str.startswith("next "):
            day_name = date_str.split("next ")[1]
            if day_name in days_map:
                target_date = today + relativedelta(weekday=days_map[day_name](+1))
                return target_date.strftime("%Y-%m-%d"), True

        if date_str.startswith("this "):
            day_name = date_str.split("this ")[1]
            if day_name in days_map:
                target_weekday = days_map[day_name]
                # If today is already the target day, return today's date
                if today.weekday() == target_weekday.weekday:
                    return today.strftime("%Y-%m-%d"), True
                # Otherwise, find the next occurrence of the target day within the current week
                target_date = today + relativedelta(weekday=target_weekday(0))
                return target_date.strftime("%Y-%m-%d"), True

        p = inflect.engine()
        word_to_digits: dict = {p.number_to_words(i): i for i in range(1, 100)}
        date_str_copy = date_str
        for word, digit in word_to_digits.items():
            if f"{word}" in date_str_copy:
                date_str_copy = date_str_copy.replace(f"{word}", f"{digit}")
                break
        # match (in) # units
        print(date_str_copy)
        match = re.match(r"(?:in\s*)?(\d+)\s+(day|days|month|months)", date_str_copy)
        if match:
            num_units, unit = match.groups()
            if unit == "day" or unit == "days":
                return (today + timedelta(days=int(num_units))).strftime(
                    "%Y-%m-%d"
                ), True
            elif unit == "month" or unit == "months":
                return (today + relativedelta(months=int(num_units))).strftime(
                    "%Y-%m-%d"
                ), True
            else:
                print(
                    f'{date_str_copy}({date_str}) can not parsed into "(in) # units" format'
                )

        try:  # Check if the input date is in the format "YYYY-MM-DD"
            target_date = parser.parse(date_str, fuzzy=True).date()
            return target_date.strftime("%Y-%m-%d"), True
        except ValueError:
            return "Invalid date format", False

    def _parse_time(self, time_str: str) -> str:
        try:
            # Parse the input time string
            time_obj = datetime.strptime(
                time_str, "%I:%M %p"
            )  # 12-hour format with AM/PM
        except ValueError:
            try:
                # Handle incorrect PM format like "13:00 PM"
                time_obj = datetime.strptime(
                    time_str, "%H:%M %p"
                )  # 24-hour with AM/PM (incorrect format)
            except ValueError:
                try:
                    # Handle 24-hour format like "13:00"
                    time_obj = datetime.strptime(time_str, "%H:%M")
                except ValueError:
                    return "Invalid time format"

        # Convert to HH:MM:SS.mmmmmm format
        return time_obj.strftime("%H:%M:%S.%f")

    def booking_appointment(
        self,
        user_name: str,
        time: str,
        date: str,
        user_email: str = None,
        task: str = None,
    ) -> bool:
        """
        Book an appointment for the user
        date can be
        "today", "tomorrow", "next monday", "this friday", or "2025-02-27" format
        time can be "10:00 AM" or "10:00 PM" or "13:00 PM" format
        return True if the appointment is successfully booked
        return False if the appointment is not available
        """
        parsed_date, is_valid = self._parse_date(date)
        if not is_valid:
            print("invalied date")
            return False

        start_time = datetime.strptime(
            parsed_date + self._parse_time(time), "%Y-%m-%d%H:%M:%S.%f"
        )
        end_time = start_time + timedelta(hours=1)
        is_available = self._is_available_at_time(start_time, end_time)
        print(is_available)
        # if not is_available:
        #     return False
        if is_available == False:
            print("hit")
            return False
        if user_email:
            self._create_event(
                summary=f"{task}/{user_name}",
                start_time=start_time,
                end_time=end_time,
                attendees=[{"email": user_email}],
            )
        else:
            self._create_event(
                summary=f"{task}/{user_name}",
                start_time=start_time,
                end_time=end_time,
            )
        return True

    def check_availability(
        self,
        date: str,
        time: str,
    ) -> bool:
        """
        Check if the appointment is available
        return True if the appointment is available
        return False if the appointment is not available
        """
        parsed_date, is_valid = self._parse_date(date)
        if not is_valid:
            return False
        start_time = datetime.strptime(
            parsed_date + self._parse_time(time), "%Y-%m-%d%H:%M:%S.%f"
        )
        end_time = start_time + timedelta(hours=1)
        return self._is_available_at_time(start_time, end_time)

    def cancel_appointment(
        self,
        user_email: str,
        date: str,
        prev_start_time: datetime,
    ) -> bool:
        """
        Cancel the appointment
        for the date and prev_start_time, we cancel the appointment
        which has the exact same start time

        return True if the appointment is successfully cancelled
        return False if the appointment is not found
        # return the reservation if the time is not match
        """
        parsed_date, is_valid = self._parse_date(date)
        if not is_valid:
            return False
        target_start_time = datetime.strptime(
            parsed_date + self._parse_time(prev_start_time), "%Y-%m-%d%H:%M:%S.%f"
        )
        events = self._get_events_with_attendee_email_n_prev_time(
            user_email=user_email, min_time=target_start_time - timedelta(hours=1)
        )
        if not events:
            return False
        else:
            # target_event = None
            for e in events:
                # Define the timezone
                los_angeles_tz = pytz.timezone("America/Los_Angeles")

                # Localize the target start time to the correct timezone
                localized_target_time = los_angeles_tz.localize(target_start_time)

                # Compare the timezone-aware times directly
                if e["start"]["dateTime"] == localized_target_time.isoformat():
                    try:
                        print(f"Deleting the event: {e}")
                        self._delete_event(e["id"])
                        return True
                    except HttpError as error:
                        print(f"An error occurred: {error}")
                        return False
                    break
            return False


def print_event(event):
    start = event["start"].get("dateTime", event["start"].get("date"))
    print(start, event["summary"])


def main():
    try:
        google_calendar = GoogleCalendar()
        events = google_calendar._get_events()
        if not events:
            print("No upcoming events found.")
            return
        for event in events:
            print_event(event)

        now = datetime.now()
        end_time = now + timedelta(hours=1)  # 1 hour from now
        print(now, end_time)
        events = google_calendar._is_available_at_time(
            start_time=now, end_time=end_time
        )
        print(events)

        # get_events_with_attendee_email
        events = google_calendar._get_events_with_attendee_email("svelagala@ucsd.edu")
        print(events)
        return

        # Create an event
        start_time = datetime.now()
        end_time = start_time.replace(hour=start_time.hour + 1)
        google_calendar.create_event(
            summary="Test Event",
            start_time=start_time,
            end_time=end_time,
            description="This is a test event",
            attendees=[
                {"email": ""},
                {"email": ""},
            ],
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


def final_main():
    google_calendar = GoogleCalendar()
    result = google_calendar.booking_appointment(
        user_name="Mary",
        time="13:00 PM",
        date="in one month",
        task="Hair Treatment",
    )
    print(result)
    # result = google_calendar.cancel_appointment(
    #     user_email="Sai",
    #     date="today",
    #     prev_start_time="5:00 PM",
    # )
    # print(result)
    # result = google_calendar.cancel_appointment(
    #     user_email="Sai",
    #     date="today",
    #     prev_start_time="6:00 PM",
    # )
    # print(result)


if __name__ == "__main__":
    final_main()
