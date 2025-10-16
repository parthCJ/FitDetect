from app.detection.pose_detector import PoseDetector
import mediapipe as mp

class SquatDetector:
    """
    Squat exercise detection and counting
    """
    def __init__(self):
        self.pose_detector = PoseDetector()
        self.mp_pose = mp.solutions.pose
        
        # Squat state
        self.counter = 0
        self.stage = None  # "up" or "down"
        
        # Angle thresholds
        self.down_threshold = 90  # Knee angle when in down position
        self.up_threshold = 160   # Knee angle when standing
        
    def detect(self, image):
        """
        Detect squat and count repetitions
        Returns: processed_image, counter, stage, feedback
        """
        results, image_rgb = self.pose_detector.detect_pose(image)
        landmarks = self.pose_detector.get_landmarks(results)
        
        feedback = ""
        
        if landmarks:
            # Get key landmarks for squat detection
            # Left side
            left_hip = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_HIP.value
            )
            left_knee = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_KNEE.value
            )
            left_ankle = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.LEFT_ANKLE.value
            )
            
            # Right side
            right_hip = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_HIP.value
            )
            right_knee = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_KNEE.value
            )
            right_ankle = self.pose_detector.get_landmark_coords(
                landmarks, self.mp_pose.PoseLandmark.RIGHT_ANKLE.value
            )
            
            # Calculate knee angles
            if all([left_hip, left_knee, left_ankle]):
                left_angle = self.pose_detector.calculate_angle(
                    left_hip, left_knee, left_ankle
                )
            else:
                left_angle = 180
            
            if all([right_hip, right_knee, right_ankle]):
                right_angle = self.pose_detector.calculate_angle(
                    right_hip, right_knee, right_ankle
                )
            else:
                right_angle = 180
            
            # Average angle
            avg_angle = (left_angle + right_angle) / 2
            
            # Count squats based on angle
            if avg_angle > self.up_threshold:
                self.stage = "up"
                feedback = "Standing - Good!"
            
            if avg_angle < self.down_threshold and self.stage == "up":
                self.stage = "down"
                self.counter += 1
                feedback = "Squat counted!"
            
            # Provide form feedback
            if self.down_threshold < avg_angle < self.up_threshold:
                if self.stage == "up":
                    feedback = "Going down..."
                else:
                    feedback = "Stand up!"
            
            # Additional form checks
            if avg_angle < self.down_threshold:
                # Check if back is straight (optional improvement)
                feedback = "Good depth! Now stand up!"
        
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
