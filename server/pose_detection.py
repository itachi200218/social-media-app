# pose_detection.py
import numpy as np
from utils import calculate_angle  # Assuming calculate_angle is in utils.py

def detect_squats(landmarks):
    # Define landmarks for squat detection (e.g., hip, knee, and ankle)
    hip = [landmarks[23].x, landmarks[23].y]  # Example: Hip
    knee = [landmarks[25].x, landmarks[25].y]  # Example: Knee
    ankle = [landmarks[27].x, landmarks[27].y]  # Example: Ankle

    squat_angle = calculate_angle(hip, knee, ankle)
    return squat_angle

def detect_pushups(landmarks):
    # Define landmarks for pushup detection (e.g., shoulder, elbow, wrist)
    shoulder = [landmarks[11].x, landmarks[11].y]  # Example: Shoulder
    elbow = [landmarks[13].x, landmarks[13].y]  # Example: Elbow
    wrist = [landmarks[15].x, landmarks[15].y]  # Example: Wrist

    pushup_angle = calculate_angle(shoulder, elbow, wrist)
    return pushup_angle
