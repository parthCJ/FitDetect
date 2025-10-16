import cv2
import mediapipe as mp
import numpy as np
from typing import Tuple, Optional

class PoseDetector:
    """
    Pose detection using Mediapipe
    """
    def __init__(
        self,
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
    def detect_pose(self, image):
        """
        Detect pose in image
        Returns: results, image_rgb
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process image
        results = self.pose.process(image_rgb)
        
        return results, image_rgb
    
    def draw_landmarks(self, image, results):
        """
        Draw pose landmarks on image
        """
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
                self.mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
            )
        return image
    
    def get_landmarks(self, results):
        """
        Extract landmark coordinates
        """
        if not results.pose_landmarks:
            return None
        
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append({
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
        
        return landmarks
    
    def calculate_angle(self, point1: dict, point2: dict, point3: dict) -> float:
        """
        Calculate angle between three points
        Args:
            point1, point2, point3: Dictionary with 'x', 'y', 'z' coordinates
        Returns:
            Angle in degrees
        """
        # Convert to numpy arrays
        a = np.array([point1['x'], point1['y']])
        b = np.array([point2['x'], point2['y']])
        c = np.array([point3['x'], point3['y']])
        
        # Calculate vectors
        ba = a - b
        bc = c - b
        
        # Calculate angle
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    def get_landmark_coords(self, landmarks, landmark_index: int) -> Optional[dict]:
        """
        Get specific landmark coordinates
        """
        if landmarks and len(landmarks) > landmark_index:
            return landmarks[landmark_index]
        return None
    
    def close(self):
        """
        Close pose detector
        """
        self.pose.close()
