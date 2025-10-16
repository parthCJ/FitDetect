from app.detection.pose_detector import PoseDetector
import mediapipe as mp

class PushupDetector:
    """
    Push-up exercise detection and counting
    """
    def __init__(self):
        self.pose_detector = PoseDetector()
        self.mp_pose = mp.solutions.pose
        
        # Push-up state
        self.counter = 0
        self.stage = None  # "up" or "down"
        
        # Angle thresholds
        self.down_threshold = 90  # Elbow angle when in down position
        self.up_threshold = 160   # Elbow angle when in up position
        
    def detect(self, image):
        """
        Detect push-up and count repetitions
        Returns: processed_image, counter, stage, feedback
        """
        results, image_rgb = self.pose_detector.detect_pose(image)
        landmarks = self.pose_detector.get_landmarks(results)
        
        feedback = ""
        
        if landmarks:
            # Get key landmarks for push-up detection
            # Left side
            left_shoulder = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_SHOULDER.value
            )
            left_elbow = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_ELBOW.value
            )
            left_wrist = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_WRIST.value
            )
            
            # Right side
            right_shoulder = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value
            )
            right_elbow = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_ELBOW.value
            )
            right_wrist = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_WRIST.value
            )
            
            # Calculate elbow angles
            if all([left_shoulder, left_elbow, left_wrist]):
                left_angle = self.pose_detector.calculate_angle(
                    left_shoulder, left_elbow, left_wrist
                )
            else:
                left_angle = 180
            
            if all([right_shoulder, right_elbow, right_wrist]):
                right_angle = self.pose_detector.calculate_angle(
                    right_shoulder, right_elbow, right_wrist
                )
            else:
                right_angle = 180
            
            # Average angle
            avg_angle = (left_angle + right_angle) / 2
            
            # Count push-ups based on angle
            if avg_angle > self.up_threshold:
                self.stage = "up"
                feedback = "Arms extended - Good!"
            
            if avg_angle < self.down_threshold and self.stage == "up":
                self.stage = "down"
                self.counter += 1
                feedback = "Push-up counted!"
            
            # Provide form feedback
            if self.down_threshold < avg_angle < self.up_threshold:
                if self.stage == "up":
                    feedback = "Going down..."
                else:
                    feedback = "Push up!"
        
        # Draw landmarks
        image = self.pose_detector.draw_landmarks(image, results)
        
        return image, self.counter, self.stage, feedback
    
    def reset(self):
        """Reset counter and stage"""
        self.counter = 0
        self.stage = None
    
    def close(self):
        """Close detector"""
        self.pose_detector.close()
