# fitness_ai.py
import cv2
import mediapipe as mp
from pose_detection import detect_squats, detect_pushups  # Import functions from pose_detection
from face_detection import detect_smile
from utils import enhance_night_vision
import json
import sys
# Initialize MediaPipe modules
mp_pose = mp.solutions.pose
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

pose = mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
face_detection = mp_face_detection.FaceDetection(min_detection_confidence=0.7)

squat_count = 0
pushup_count = 0
squat_position = None
pushup_position = None
cancelled = False

def webcam_capture():
    global cancelled, squat_count, pushup_count, squat_position, pushup_position

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Camera not found or cannot be opened.")
        exit()

    frame_skip = 2
    frame_count = 0

    while cap.isOpened() and not cancelled:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Pose detection
        results_pose = pose.process(frame_rgb)
        # Face detection
        results_face = face_detection.process(frame_rgb)

        if results_pose.pose_landmarks:
            mp_drawing.draw_landmarks(frame, results_pose.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            landmarks = results_pose.pose_landmarks.landmark

            # Squats and Pushups detection
            squat_angle = detect_squats(landmarks)  # Call the function from pose_detection
            pushup_angle = detect_pushups(landmarks)  # Call the function from pose_detection

            # Logic for counting squats and pushups
            if squat_angle < 90 and squat_position != 'down':
                squat_position = 'down'
            elif squat_angle > 160 and squat_position == 'down':
                squat_count += 1
                squat_position = 'up'

            if pushup_angle < 90 and pushup_position != 'down':
                pushup_position = 'down'
            elif pushup_angle > 160 and pushup_position == 'down':
                pushup_count += 1
                pushup_position = 'up'

        # Face detection and Smile detection
        if results_face.detections:  # Use 'detections' instead of 'multi_face_landmarks'
            for detection in results_face.detections:
                bboxC = detection.location_data.relative_bounding_box
                ih, iw, _ = frame.shape
                x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
                cv2.putText(frame, f"Face: {int(detection.score[0] * 100)}%", (x, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # Ensure multi_face_landmarks exists before accessing for smile detection
        if results_face.detections:  # Changed to use 'detections'
            for detection in results_face.detections:
                if detect_smile(detection):
                    cv2.putText(frame, "Smile Detected", (10, 220),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Enhance night vision only for display (not for processing)
        enhanced_frame = enhance_night_vision(frame)

        # Display counters for squats and pushups
        cv2.putText(enhanced_frame, f'Squats: {squat_count}', (10, 140),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(enhanced_frame, f'Pushups: {pushup_count}', (10, 180),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)

        cv2.putText(enhanced_frame, 'Press ESC to Exit', (10, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        cv2.imshow('Smart Fitness AI (Improved)', enhanced_frame)

        if cv2.waitKey(10) & 0xFF == 27:  # ESC key to exit
            break

    cap.release()
    cv2.destroyAllWindows()
# Print message indicating Fitness AI is working
result = {'message': 'Fitness AI is working!'}
print(json.dumps(result))
sys.stdout.flush()

if __name__ == "__main__":
    webcam_capture()
