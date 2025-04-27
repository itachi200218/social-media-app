import cv2
import mediapipe as mp
import numpy as np
import json
import sys

# Initialize MediaPipe pose, face detection, and face mesh classes
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.8)
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(min_detection_confidence=0.8)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.8, min_tracking_confidence=0.8)
mp_drawing = mp.solutions.drawing_utils

# Variables for counting
squat_count = 0
squat_position = None  # 'up' or 'down'

# Calculate angle between three points
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    return angle

# Flag to control webcam shutdown
cancelled = False

def process_pose(frame_rgb):
    return pose.process(frame_rgb)

def process_face(frame_rgb):
    return face_detection.process(frame_rgb)

def process_face_mesh(frame_rgb):
    return face_mesh.process(frame_rgb)

def webcam_capture():
    global cancelled, squat_position, squat_count
    # Open webcam
    cap = cv2.VideoCapture(0)

    # Set resolution for improved performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 240)  # Set width
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 320)  # Set height

    frame_skip = 3  # Process every 3rd frame
    frame_count = 0

    while cap.isOpened() and not cancelled:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue  # Skip this frame

        # Flip the frame horizontally and convert to RGB
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process pose, face, and face mesh concurrently
        results_pose = process_pose(frame_rgb)
        results_face = process_face(frame_rgb)
        results_face_mesh = process_face_mesh(frame_rgb)

        if results_pose.pose_landmarks:
            # Draw landmarks for pose
            mp_drawing.draw_landmarks(frame, results_pose.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            landmarks = results_pose.pose_landmarks.landmark

            # Get coordinates of key body points
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

            # Calculate angle between hip, knee, and ankle
            angle = calculate_angle(hip, knee, ankle)

            # Display angle for debugging
            cv2.putText(frame, f'Angle: {int(angle)}', (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

            # Squat detection logic
            if angle < 90:  # Below 90 degrees, squat down
                if squat_position != 'down':
                    squat_position = 'down'
            elif angle > 160:  # Above 160 degrees, squat up
                if squat_position == 'down':
                    squat_count += 1
                    squat_position = 'up'

        # Display squat count
        cv2.putText(frame, f'Squats: {squat_count}', (50, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)

        # If a face is detected, draw a box around it
        if results_face.detections:
            for detection in results_face.detections:
                # Draw a bounding box around the detected face
                bboxC = detection.location_data.relative_bounding_box
                ih, iw, _ = frame.shape
                x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                # Optionally display the confidence score
                cv2.putText(frame, f"Face Confidence: {int(detection.score[0] * 100)}%", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

        # If face mesh is processed, detect smile by analyzing mouth landmarks
        if results_face_mesh.multi_face_landmarks:
            for face_landmarks in results_face_mesh.multi_face_landmarks:
                # Get mouth landmarks (points 13 to 17 are the corners of the mouth)
                mouth_left = face_landmarks.landmark[13]
                mouth_right = face_landmarks.landmark[17]

                # Calculate distance between the corners of the mouth to detect smile
                mouth_distance = np.linalg.norm(np.array([mouth_left.x, mouth_left.y]) - np.array([mouth_right.x, mouth_right.y]))

                # If the distance is greater than a threshold, consider it a smile
                if mouth_distance > 0.06:
                    cv2.putText(frame, "Smile Detected", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        # Display the "Press ESC to exit" message on the camera feed
        cv2.putText(frame, 'Press ESC to exit', (50, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        # Display the frame
        cv2.imshow('Smart Fitness Trainer - Squat Counter, Face Detection, and Smile Detection', frame)

        # Break the loop if 'Esc' is pressed
        if cv2.waitKey(10) & 0xFF == 27:  # Press Esc to quit the webcam
            break

    # Release the video capture object and close all OpenCV windows
    cap.release()
    cv2.destroyAllWindows()

# Print message indicating Fitness AI is working
result = {'message': 'Fitness AI is working!'}
print(json.dumps(result))
sys.stdout.flush()

# Keep the server running (this could be a Flask server or any other)
try:
    # You can implement your server logic here or just block the main thread
    webcam_capture()  # Start webcam capture

except KeyboardInterrupt:
    cancelled = True
    print("Server stopped manually.")
