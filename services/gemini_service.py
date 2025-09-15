import asyncio
import logging
import time
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
        self.max_retries = 3
        self.base_delay = 1  # seconds
    
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
            
            # Generation configuration with timeout settings
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
    
    async def test_connection(self) -> bool:
        """Test the connection to Gemini API."""
        try:
            test_prompt = "Say hello"
            response = await self._generate_content_with_retry(test_prompt)
            logger.info("Gemini API connection test successful")
            return True
        except Exception as e:
            logger.error(f"Gemini API connection test failed: {e}")
            return False
    
    async def _generate_content_with_retry(self, prompt: str) -> str:
        """Generate content with retry logic."""
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting to generate content with Gemini (attempt {attempt + 1}/{max_retries})...")
                
                # Use asyncio.wait_for to add timeout
                response = await asyncio.wait_for(
                    self._generate_content_internal(prompt),
                    timeout=120.0  # 2 minute timeout
                )
                
                return response
            except asyncio.TimeoutError:
                logger.error(f"Request timed out after 120 seconds (attempt {attempt + 1})")
                if attempt == max_retries - 1:
                    raise Exception("Request timed out after multiple attempts. Please try again.")
                await asyncio.sleep(base_delay * (2 ** attempt))  # Exponential backoff
            except Exception as e:
                logger.error(f"Error generating content (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise e
                await asyncio.sleep(base_delay * (2 ** attempt))  # Exponential backoff
    
    async def _generate_content_internal(self, prompt: str) -> str:
        """Internal method to generate content."""
        try:
            # Generate content synchronously but in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(
                    prompt,
                    request_options={
                        'timeout': 120  # 2 minute timeout for the request
                    }
                )
            )
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")
            
            logger.info(f"Generated content successfully. Length: {len(response.text)} characters")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Internal content generation failed: {e}")
            # Re-raise with more specific error message
            if "timeout" in str(e).lower():
                raise Exception("Request timed out. Please try again with shorter content or check your internet connection.")
            elif "503" in str(e) or "connection" in str(e).lower():
                raise Exception("Unable to connect to AI service. Please check your internet connection and try again.")
            else:
                raise Exception(f"AI service error: {str(e)}")
    
    async def _generate_content(self, prompt: str) -> str:
        """Generate content using Gemini API with error handling and retry logic."""
        try:
            return await self._generate_content_with_retry(prompt)
        except Exception as e:
            logger.error(f"Failed to generate content with Gemini: {e}")
            raise Exception(f"AI service error: {str(e)}")
    
    async def summarize_content(self, text: str) -> str:
        """
        Generate a comprehensive summary of the educational content.
        
        Args:
            text: The course content to summarize
            
        Returns:
            str: Generated summary
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        prompt = f"""
        Create a comprehensive and well-structured summary of the following educational content.
        Your summary should be:
        
        📋 REQUIREMENTS:
        • Clear and concise while maintaining essential information
        • Organized with proper sections and bullet points
        • Include key concepts, definitions, and main ideas
        • Highlight important formulas, theories, or principles
        • Use emojis and formatting for better readability
        • Suitable for student review and quick reference
        
        📚 CONTENT TO SUMMARIZE:
        {text}
        
        📝 STRUCTURED SUMMARY:
        
        ## 🎯 Main Topic & Objective
        [Clearly state what this content covers]
        
        ## 🔑 Key Concepts
        • [List main concepts with brief explanations]
        
        ## 📊 Important Details
        • [Include crucial facts, formulas, or data]
        
        ## 💡 Examples & Applications
        • [Provide practical examples or use cases]
        
        ## 📌 Key Takeaways
        • [List the most important points to remember]
        
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
        اشرح المحتوى التعليمي التالي بالعربية بطريقة شاملة ومفصلة.
        
        🎯 المطلوب في الشرح:
        • شرح واضح ومفصل باستخدام لغة بسيطة ومفهومة
        • تقسيم المفاهيم المعقدة إلى أجزاء سهلة الفهم
        • إدراج أمثلة عملية وتطبيقية من الحياة اليومية
        • استخدام الرموز التعبيرية والتنسيق لسهولة القراءة
        • توضيح الصيغ أو النظريات المهمة مع شرحها
        • ربط المفاهيم ببعضها البعض
        
        📚 المحتوى التعليمي:
        {text}
        
        📖 الشرح التفصيلي بالعربية:
        
        ## 🔍 نظرة عامة
        [مقدمة موجزة عن الموضوع]
        
        ## 📝 المفاهيم الأساسية
        [شرح المفاهيم الرئيسية بالتفصيل]
        
        ## 🌟 أمثلة عملية
        [أمثلة واضحة من الحياة اليومية]
        
        ## 🔗 الروابط والعلاقات
        [كيف ترتبط هذه المفاهيم مع بعضها]
        
        ## 💡 نصائح للفهم والحفظ
        [استراتيجيات لفهم وتذكر المعلومات]
        
        الشرح:
        """
        
        # English explanation prompt
        english_prompt = f"""
        Provide a comprehensive and detailed explanation of the following educational content.
        
        🎯 EXPLANATION REQUIREMENTS:
        • Clear and detailed explanation using simple, understandable language
        • Break down complex concepts into easily digestible parts
        • Include practical examples from everyday life and real-world applications
        • Use emojis and formatting for better readability
        • Explain important formulas or theories with context
        • Show connections between different concepts
        • Provide memory aids and learning tips
        
        📚 EDUCATIONAL CONTENT:
        {text}
        
        📖 DETAILED EXPLANATION:
        
        ## 🔍 Overview
        [Brief introduction to the topic]
        
        ## 📝 Core Concepts
        [Detailed explanation of main concepts]
        
        ## 🌟 Practical Examples
        [Clear examples from everyday life]
        
        ## 🔗 Connections & Relationships
        [How these concepts relate to each other]
        
        ## 💡 Learning Tips & Memory Aids
        [Strategies for understanding and remembering]
        
        ## 🧪 Practice Applications
        [How to apply this knowledge]
        
        Explanation:
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
        Create 5 comprehensive educational exercises based on the following course content.
        The exercises should cover different skill levels and question types.
        
        🎯 EXERCISE REQUIREMENTS:
        • Include variety: multiple choice, short answer, problem-solving, application questions
        • Progress from basic understanding to advanced application
        • Provide detailed, educational answers with explanations
        • Include step-by-step solutions where appropriate
        • Add learning tips and common mistakes to avoid
        • Use clear numbering and formatting
        
        📚 COURSE CONTENT:
        {text}
        
        📝 STRUCTURED EXERCISES:
        
        Exercise 1: 🔰 Basic Understanding
        Type: [Multiple Choice/Short Answer/Fill in the blank]
        Question: [Clear, direct question testing fundamental concepts]
        A) [Option A - if multiple choice]
        B) [Option B - if multiple choice]
        C) [Option C - if multiple choice]
        D) [Option D - if multiple choice]
        Answer: [Correct answer with detailed explanation]
        Why: [Explanation of the concept and why other options are wrong]
        
        Exercise 2: 📊 Concept Application
        Type: [Problem Solving/Analysis]
        Question: [Question requiring application of concepts]
        Answer: [Step-by-step solution with explanations]
        Key Points: [Important concepts demonstrated]
        
        Exercise 3: 🧠 Critical Thinking
        Type: [Analysis/Comparison/Evaluation]
        Question: [Question requiring deeper analysis]
        Answer: [Comprehensive answer with reasoning]
        Tips: [Learning strategies and insights]
        
        Exercise 4: 🔬 Real-World Application
        Type: [Practical Application]
        Question: [Question connecting theory to real-world scenarios]
        Answer: [Practical solution with context]
        Connection: [How this relates to real-life situations]
        
        Exercise 5: 🎯 Advanced Challenge
        Type: [Synthesis/Problem Solving]
        Question: [Complex question combining multiple concepts]
        Answer: [Detailed solution with multiple steps]
        Common Mistakes: [What students often get wrong and how to avoid it]
        
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
