import asyncio
import logging
from typing import Dict, List, Optional, Tuple
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from config.settings import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini API."""
    
    def __init__(self):
        self.config = get_config()
        self._configure_api()
        self.model = None
        self._initialize_model()
    
    def _configure_api(self) -> None:
        """Configure the Gemini API with API key."""
        try:
            genai.configure(api_key=self.config.GEMINI_API_KEY)
            logger.info("Gemini API configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure Gemini API: {e}")
            raise
    
    def _initialize_model(self) -> None:
        """Initialize the Gemini model with safety settings."""
        try:
            # Safety settings to handle educational content appropriately
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            # Generation configuration
            generation_config = genai.types.GenerationConfig(
                temperature=self.config.TEMPERATURE,
                max_output_tokens=self.config.MAX_TOKENS,
                top_p=0.8,
                top_k=40
            )
            
            self.model = genai.GenerativeModel(
                model_name=self.config.GEMINI_MODEL,
                safety_settings=safety_settings,
                generation_config=generation_config
            )
            logger.info(f"Gemini model '{self.config.GEMINI_MODEL}' initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            raise
    
    async def _generate_content(self, prompt: str) -> str:
        """Generate content using Gemini API with error handling."""
        try:
            # Run the synchronous API call in a thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            logger.info(f"Generated content successfully. Length: {len(response.text)} characters")
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Failed to generate content with Gemini: {e}")
            raise Exception(f"AI service error: {str(e)}")
    
    async def summarize_content(self, text: str) -> str:
        """
        Summarize course content using Gemini API.
        
        Args:
            text: The course content to summarize
            
        Returns:
            str: A concise summary of the content
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        prompt = f"""
        Summarize the following course content in clear, simple terms. 
        Make it concise but comprehensive, suitable for students learning the topic.
        Focus on the key concepts and main ideas.
        
        Course Content:
        {text}
        
        Summary:
        """
        
        try:
            summary = await self._generate_content(prompt)
            logger.info("Content summarized successfully")
            return summary
        except Exception as e:
            logger.error(f"Failed to summarize content: {e}")
            raise
    
    async def explain_content(self, text: str) -> Tuple[str, str]:
        """
        Generate detailed explanations in both Arabic and English.
        
        Args:
            text: The course content to explain
            
        Returns:
            Tuple[str, str]: (arabic_explanation, english_explanation)
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        # Arabic explanation prompt
        arabic_prompt = f"""
        اشرح المحتوى التعليمي التالي بالعربية بشكل مفصل ومفهوم للطلاب.
        استخدم أمثلة واضحة ولغة بسيطة مناسبة للتعلم.
        اجعل الشرح شاملاً ومفيداً للطالب.
        
        المحتوى التعليمي:
        {text}
        
        الشرح بالعربية:
        """
        
        # English explanation prompt
        english_prompt = f"""
        Explain the following course content in detailed English.
        Use clear examples and simple language appropriate for learning.
        Make the explanation comprehensive and helpful for students.
        Break down complex concepts into understandable parts.
        
        Course Content:
        {text}
        
        Detailed Explanation:
        """
        
        try:
            # Generate both explanations concurrently
            arabic_task = self._generate_content(arabic_prompt)
            english_task = self._generate_content(english_prompt)
            
            arabic_explanation, english_explanation = await asyncio.gather(
                arabic_task, 
                english_task
            )
            
            logger.info("Content explained in both languages successfully")
            return arabic_explanation, english_explanation
            
        except Exception as e:
            logger.error(f"Failed to explain content: {e}")
            raise
    
    async def generate_exercises(self, text: str) -> List[Dict[str, str]]:
        """
        Generate educational exercises based on course content.
        
        Args:
            text: The course content to create exercises from
            
        Returns:
            List[Dict[str, str]]: List of exercises with questions and answers
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        prompt = f"""
        Create 3 educational exercises based on the following course content.
        Each exercise must include a clear question and a correct, detailed answer.
        Make the questions challenging but appropriate for the learning level.
        Ensure the answers are comprehensive and educational.
        
        Format your response as follows:
        Exercise 1:
        Question: [Your question here]
        Answer: [Your detailed answer here]
        
        Exercise 2:
        Question: [Your question here]
        Answer: [Your detailed answer here]
        
        Exercise 3:
        Question: [Your question here]
        Answer: [Your detailed answer here]
        
        Course Content:
        {text}
        
        Exercises:
        """
        
        try:
            exercises_text = await self._generate_content(prompt)
            exercises = self._parse_exercises(exercises_text)
            
            if len(exercises) < 3:
                logger.warning(f"Generated only {len(exercises)} exercises instead of 3")
            
            logger.info(f"Generated {len(exercises)} exercises successfully")
            return exercises
            
        except Exception as e:
            logger.error(f"Failed to generate exercises: {e}")
            raise
    
    def _parse_exercises(self, exercises_text: str) -> List[Dict[str, str]]:
        """
        Parse the generated exercises text into structured format.
        
        Args:
            exercises_text: Raw text containing exercises
            
        Returns:
            List[Dict[str, str]]: Parsed exercises
        """
        exercises = []
        current_question = ""
        current_answer = ""
        in_question = False
        in_answer = False
        
        lines = exercises_text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('Exercise') and ':' in line:
                # Save previous exercise if exists
                if current_question and current_answer:
                    exercises.append({
                        "question": current_question.strip(),
                        "answer": current_answer.strip()
                    })
                current_question = ""
                current_answer = ""
                in_question = False
                in_answer = False
                continue
            
            if line.startswith('Question:'):
                current_question = line.replace('Question:', '').strip()
                in_question = True
                in_answer = False
                continue
            
            if line.startswith('Answer:'):
                current_answer = line.replace('Answer:', '').strip()
                in_question = False
                in_answer = True
                continue
            
            # Continue building question or answer
            if in_question and line:
                current_question += " " + line
            elif in_answer and line:
                current_answer += " " + line
        
        # Save the last exercise
        if current_question and current_answer:
            exercises.append({
                "question": current_question.strip(),
                "answer": current_answer.strip()
            })
        
        # Fallback: if parsing fails, create simple exercises
        if not exercises and exercises_text:
            exercises = [
                {
                    "question": "Based on the content provided, what are the main concepts to understand?",
                    "answer": exercises_text[:500] + "..." if len(exercises_text) > 500 else exercises_text
                }
            ]
        
        return exercises

# Global Gemini service instance
gemini_service = GeminiService()
