import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from google_calendar import GoogleCalendar

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}}, supports_credentials=True)


def send_message_to_google_colab(message: str):
    """
    return format:
    {
        'response': {
            'Date': '2025-05-29',
            'Intent': 'CancelAppointment',
            'Task': 'Massage',
            'Time': '11:00 AM',
            'User': 'Amy Duncha',
        }
    }
    """
    colab_public_url = "https://ec2b-34-16-210-134.ngrok-free.app"
    colab_be_url = colab_public_url + "/chat"
    header = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = {"message": message}
    response = requests.post(
        url=colab_be_url,
        headers=header,
        json=data,
    )
    print(response.json())
    return response.json()


@app.route(
    "/chat",
    methods=["POST"],
)
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    print(f"user_input: {user_message}")
    parsed_data_from_model = send_message_to_google_colab(user_message)
    print(f"parsed_input: {parsed_data_from_model}")

    parsed_data = parsed_data_from_model.get("response", {})
    user_name = parsed_data.get("User", "")
    appointment_date = parsed_data.get("Date", "")
    appointment_time = parsed_data.get("Time", "")
    appointment_task = parsed_data.get("Task", "")
    appointment_intent = parsed_data.get("Intent", "")

    gc = GoogleCalendar()

    if "cancel" in appointment_intent.lower():
        print("CancelAppointment")
        result = gc.cancel_appointment(
            user_email=user_name,
            date=appointment_date,
            prev_start_time=appointment_time,
        )
        print(result)
    elif "book" in appointment_intent.lower():
        print("BookingAppointment")
        result = gc.booking_appointment(
            user_name=user_name,
            time=appointment_time,
            date=appointment_date,
            task=appointment_task,
        )
        print(result)
    elif "check" in appointment_intent.lower():
        print("CheckAvailability")
        result = gc.check_availability(
            date=appointment_date,
            time=appointment_time,
        )
        print(result)
    else:
        print("Unknown intent")
        result = "Unknown intent"

    return jsonify(
        {
            "parsed_data": parsed_data,
            "Result": result,
            "User": user_name,
            "Date": appointment_date,
            "Time": appointment_time,
            "Intent": appointment_intent,
            "Task": appointment_task,
        }
    )

# a = 1 if b == 3 else 3
