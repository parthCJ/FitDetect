from app.detection.pushup_detector import PushupDetector
from app.detection.squat_detector import SquatDetector

class ExerciseDetectorFactory:
    """
    Factory class to create exercise detectors
    """
    
    @staticmethod
    def create_detector(exercise_type: str):
        """
        Create detector based on exercise type
        Args:
            exercise_type: Type of exercise ('pushup', 'squat')
        Returns:
            Detector instance
        """
        detectors = {
            'pushup': PushupDetector,
            'squat': SquatDetector,
        }
        
        detector_class = detectors.get(exercise_type.lower())
        if not detector_class:
            raise ValueError(f"Unsupported exercise type: {exercise_type}")
        
        return detector_class()
    
    @staticmethod
    def get_available_exercises():
        """
        Get list of available exercise types
        """
        return ['pushup', 'squat']
