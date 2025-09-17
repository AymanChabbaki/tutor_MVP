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
        """Generate content with retry logic and improved error handling."""
        max_retries = 3
        base_delay = 3
        max_timeout = 90.0  # Reduced timeout to 90 seconds
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting to generate content with Gemini (attempt {attempt + 1}/{max_retries})...")
                
                # Use asyncio.wait_for to add timeout
                response = await asyncio.wait_for(
                    self._generate_content_internal(prompt),
                    timeout=max_timeout
                )
                
                return response
            except asyncio.TimeoutError:
                error_msg = f"Request timed out after {max_timeout} seconds (attempt {attempt + 1})"
                logger.error(error_msg)
                if attempt == max_retries - 1:
                    raise Exception("The AI service is currently busy. Please try again in a moment with shorter content.")
                await asyncio.sleep(base_delay * (2 ** attempt))  # Exponential backoff
            except Exception as e:
                error_str = str(e).lower()
                if "503" in error_str or "overloaded" in error_str:
                    logger.error(f"Gemini API overloaded (attempt {attempt + 1}): {e}")
                    if attempt == max_retries - 1:
                        return self._get_fallback_response(prompt)
                    await asyncio.sleep(base_delay * (2 ** attempt) + 5)  # Extra delay for overload
                elif "timeout" in error_str:
                    logger.error(f"Request timeout (attempt {attempt + 1}): {e}")
                    if attempt == max_retries - 1:
                        raise Exception("Request timed out. Please try again with shorter content.")
                    await asyncio.sleep(base_delay * (2 ** attempt))
                else:
                    logger.error(f"Error generating content (attempt {attempt + 1}): {e}")
                    if attempt == max_retries - 1:
                        return self._get_fallback_response(prompt)
                    await asyncio.sleep(base_delay * (2 ** attempt))

    def _get_fallback_response(self, prompt: str) -> str:
        """Generate a fallback response when API is unavailable."""
        logger.warning("Using fallback response due to API issues")
        
        if "summarize" in prompt.lower():
            return """# Summary

The AI service is currently experiencing high demand. Here are some general study tips:

## How to Create Your Own Summary:
• **Read through the content carefully** - Take your time to understand each section
• **Identify key concepts** - Look for main ideas, definitions, and important facts
• **Use bullet points** - Organize information in easy-to-read lists
• **Highlight important terms** - Mark vocabulary and technical terms
• **Create sections** - Group related information together

## Study Tips:
• Take breaks every 25-30 minutes
• Use active reading techniques
• Create mind maps or diagrams
• Practice explaining concepts out loud
• Review material multiple times

*Please try again in a few moments when the AI service is less busy.*"""

        elif "explain" in prompt.lower():
            return """# Explanation

The AI service is currently busy processing other requests. Here's how you can approach understanding complex topics:

## Step-by-Step Learning Approach:
1. **Start with the basics** - Understand fundamental concepts first
2. **Break it down** - Divide complex topics into smaller parts
3. **Use analogies** - Connect new information to things you already know
4. **Ask questions** - What, why, how, when, where?
5. **Practice application** - Try to use the concepts in examples

## Additional Resources:
• Look up terms in a dictionary or glossary
• Search for video explanations online
• Discuss with classmates or teachers
• Use textbooks and reference materials

*The AI service will be available again shortly. Please try your request again.*"""

        elif "exercise" in prompt.lower():
            return """# Practice Exercises

The AI service is currently overloaded. Here are some general study exercises you can try:

## 🧠 Self-Study Techniques:

### Exercise 1: Concept Mapping
**Task:** Create a visual map of the main concepts
**How:** Draw connections between related ideas
**Benefits:** Helps visualize relationships between topics

### Exercise 2: Teach-Back Method
**Task:** Explain the topic to someone else (or yourself)
**How:** Use simple language to describe key points
**Benefits:** Tests your understanding and reveals gaps

### Exercise 3: Question Generation
**Task:** Create 5-10 questions about the material
**How:** Write questions that test different levels of understanding
**Benefits:** Helps identify important information

### Exercise 4: Real-World Application
**Task:** Find examples of how this applies in real life
**How:** Think of practical uses or current examples
**Benefits:** Makes learning more meaningful and memorable

*Please try again when the AI service is less busy for personalized exercises.*"""

        else:
            return """# Service Temporarily Unavailable

The AI service is currently experiencing high demand and is temporarily overloaded. 

## What you can do:
• **Try again in a few minutes** - The service usually recovers quickly
• **Use shorter content** - Smaller requests are processed faster
• **Break up large requests** - Divide long content into smaller sections

## Alternative study methods:
• Use online educational resources
• Consult textbooks and reference materials
• Form study groups with classmates
• Seek help from teachers or tutors

*We apologize for the inconvenience. Please try your request again shortly.*"""
    
    async def _generate_content_internal(self, prompt: str) -> str:
        """Internal method to generate content."""
        try:
            # Generate content synchronously but in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")
            
            logger.info(f"Generated content successfully. Length: {len(response.text)} characters")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Internal content generation failed: {e}")
            error_str = str(e).lower()
            # Re-raise with more specific error message
            if "timeout" in error_str:
                raise Exception("Request timed out. Please try again with shorter content or check your internet connection.")
            elif "503" in error_str or "overloaded" in error_str or "rate limit" in error_str:
                raise Exception("The AI service is currently overloaded. Please try again later.")
            elif "connection" in error_str or "network" in error_str:
                raise Exception("Unable to connect to AI service. Please check your internet connection and try again.")
            else:
                raise Exception(f"AI service error: {str(e)}")
    
    async def _generate_content(self, prompt: str) -> str:
        """Generate content using Gemini API with error handling and retry logic."""
        try:
            return await self._generate_content_with_retry(prompt)
        except Exception as e:
            logger.error(f"Failed to generate content with Gemini: {e}")
            # Instead of raising, return fallback response for better user experience
            return self._get_fallback_response(prompt)
    
    async def summarize_content(self, text: str, language_preference: str = 'english') -> str:
        """
        Generate a comprehensive summary of the educational content.
        
        Args:
            text: The course content to summarize
            language_preference: Language for the summary ('english', 'arabic', or 'both')
            
        Returns:
            str: Generated summary
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        language_instruction = ""
        if language_preference.lower() == 'arabic':
            language_instruction = "يرجى كتابة الملخص باللغة العربية بشكل كامل."
        elif language_preference.lower() == 'both':
            language_instruction = "Please provide the summary in both English and Arabic languages."
        else:
            language_instruction = "Please write the summary in English."
        
        prompt = f"""
        Create a comprehensive and well-structured summary of the following educational content.
        {language_instruction}
        
        Your summary should be:
        
        REQUIREMENTS:
        • Clear and concise while maintaining essential information
        • Organized with proper sections and bullet points
        • Include key concepts, definitions, and main ideas
        • Highlight important formulas, theories, or principles
        • Professional formatting for better readability
        • Suitable for student review and quick reference
        
        CONTENT TO SUMMARIZE:
        {text}
        
        STRUCTURED SUMMARY:
        
        ## Main Topic & Objective
        [Clearly state what this content covers]
        
        ## Key Concepts
        • [List main concepts with brief explanations]
        
        ## Important Details
        • [Include crucial facts, formulas, or data]
        
        ## Examples & Applications
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
    
    async def explain_content(self, text: str, language_preference: str = 'english') -> str:
        """
        Generate detailed explanations based on language preference.
        
        Args:
            text: The course content to explain
            language_preference: Language for the explanation ('english' or 'arabic')
            
        Returns:
            str: Explanation in the requested language
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        if language_preference.lower() == 'arabic':
            # Arabic explanation prompt
            prompt = f"""
            اشرح المحتوى التعليمي التالي بالعربية بطريقة شاملة ومفصلة.
            
            المطلوب في الشرح:
            • شرح واضح ومفصل باستخدام لغة بسيطة ومفهومة
            • تقسيم المفاهيم المعقدة إلى أجزاء سهلة الفهم
            • إدراج أمثلة عملية وتطبيقية من الحياة اليومية
            • استخدام التنسيق المهني لسهولة القراءة
            • توضيح الصيغ أو النظريات المهمة مع شرحها
            • ربط المفاهيم ببعضها البعض
            
            المحتوى التعليمي:
            {text}
            
            الشرح التفصيلي بالعربية:
            
            ## نظرة عامة
            [مقدمة موجزة عن الموضوع]
            
            ## المفاهيم الأساسية
            [شرح المفاهيم الرئيسية بالتفصيل]
            
            ## أمثلة عملية
            [أمثلة واضحة من الحياة اليومية]
            
            ## الروابط والعلاقات
            [كيف ترتبط هذه المفاهيم مع بعضها]
            
            ## نصائح للفهم والحفظ
            [استراتيجيات لفهم وتذكر المعلومات]
            
            الشرح:
            """
        else:
            # English explanation prompt
            prompt = f"""
            Provide a comprehensive and detailed explanation of the following educational content.
            
            EXPLANATION REQUIREMENTS:
            • Clear and detailed explanation using simple, understandable language
            • Break down complex concepts into easily digestible parts
            • Include practical examples from everyday life and real-world applications
            • Use professional formatting for better readability
            • Explain important formulas or theories with context
            • Show connections between different concepts
            • Provide memory aids and learning tips
            
            EDUCATIONAL CONTENT:
            {text}
            
            DETAILED EXPLANATION:
            
            ## Overview
            [Brief introduction to the topic]
            
            ## Core Concepts
            [Detailed explanation of main concepts]
        
            
            ## Practical Examples
            [Clear examples from everyday life]
            
            ## Connections & Relationships
            [How these concepts relate to each other]
            
            ## Learning Tips & Memory Aids
            [Strategies for understanding and remembering]
            
            ## Practice Applications
            [How to apply this knowledge]
            
            Explanation:
            """
        
        try:
            # Generate explanation in the requested language
            explanation = await self._generate_content(prompt)
            
            logger.info(f"Content explained in {language_preference} successfully")
            return explanation
            
        except Exception as e:
            logger.error(f"Failed to explain content: {e}")
            raise
    
    async def generate_exercises(self, text: str, language_preference: str = 'english') -> List[Dict[str, str]]:
        """
        Generate educational exercises based on course content.
        
        Args:
            text: The course content to create exercises from
            language_preference: Language for the exercises ('english', 'arabic', or 'both')
            
        Returns:
            List[Dict[str, str]]: List of exercises with questions and answers
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        language_instruction = ""
        if language_preference.lower() == 'arabic':
            language_instruction = "يرجى كتابة التمارين والأسئلة والأجوبة باللغة العربية بشكل كامل."
        elif language_preference.lower() == 'both':
            language_instruction = "Please provide exercises in both English and Arabic languages."
        else:
            language_instruction = "Please write all exercises, questions, and answers in English."
        
        prompt = f"""
        Create 5 comprehensive educational exercises based on the following course content.
        {language_instruction}
        The exercises should cover different skill levels and question types.
        
        IMPORTANT: You must format each exercise EXACTLY as shown below, with clear separators:
        
        === EXERCISE 1 ===
        Question: [Write a clear, specific question here]
        Answer: [Provide a detailed answer with explanations]
        
        === EXERCISE 2 ===
        Question: [Write a clear, specific question here]
        Answer: [Provide a detailed answer with explanations]
        
        === EXERCISE 3 ===
        Question: [Write a clear, specific question here]
        Answer: [Provide a detailed answer with explanations]
        
        === EXERCISE 4 ===
        Question: [Write a clear, specific question here]
        Answer: [Provide a detailed answer with explanations]
        
        === EXERCISE 5 ===
        Question: [Write a clear, specific question here]
        Answer: [Provide a detailed answer with explanations]
        
        EXERCISE REQUIREMENTS:
        • Include variety: multiple choice, short answer, problem-solving, application questions
        • Progress from basic understanding to advanced application
        • Provide detailed, educational answers with explanations
        • Include step-by-step solutions where appropriate
        • Add learning tips and common mistakes to avoid
        • Make questions specific and clear, not generic
        
        COURSE CONTENT:
        {text}
        
        Generate the exercises now:
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
        import re
        exercises = []
        
        # Try to split by the new format first
        exercise_pattern = r'=== EXERCISE \d+ ==='
        exercise_blocks = re.split(exercise_pattern, exercises_text)[1:]  # Skip first empty part
        
        for i, block in enumerate(exercise_blocks, 1):
            try:
                # Look for Question and Answer patterns in the new format
                question_match = re.search(r'Question:\s*(.*?)(?=Answer:|$)', block, re.DOTALL)
                answer_match = re.search(r'Answer:\s*(.*?)(?=\n*$)', block, re.DOTALL)
                
                if question_match and answer_match:
                    question = question_match.group(1).strip()
                    answer = answer_match.group(1).strip()
                    
                    # Clean up formatting
                    question = re.sub(r'\n+', ' ', question).strip()
                    answer = re.sub(r'\n+', '\n', answer).strip()
                    
                    exercises.append({
                        "question": question,
                        "answer": answer,
                        "type": f"Exercise {i}",
                        "difficulty": self._determine_difficulty(i)
                    })
                    
            except Exception as e:
                logger.warning(f"Failed to parse exercise {i}: {e}")
                continue
        
        # Fallback: try old Exercise pattern
        if not exercises:
            exercise_pattern = r'Exercise \d+:'
            exercise_blocks = re.split(exercise_pattern, exercises_text)[1:]  # Skip first empty part
            
            for i, block in enumerate(exercise_blocks, 1):
                try:
                    # Look for Question and Answer patterns
                    question_match = re.search(r'Question:\s*(.*?)(?=Answer:|$)', block, re.DOTALL)
                    answer_match = re.search(r'Answer:\s*(.*?)(?=Exercise \d+:|$)', block, re.DOTALL)
                    
                    if question_match:
                        question = question_match.group(1).strip()
                        # Clean up question formatting
                        question = re.sub(r'\n+', ' ', question)
                        question = re.sub(r'^\s*Type:.*?\n', '', question, flags=re.MULTILINE)
                        question = question.strip()
                    else:
                        # Fallback: use first few lines as question
                        lines = [line.strip() for line in block.split('\n') if line.strip()]
                        question = ' '.join(lines[:2]) if lines else f"Exercise {i} - Please review the content"
                    
                    if answer_match:
                        answer = answer_match.group(1).strip()
                        # Clean up answer formatting
                        answer = re.sub(r'\n+', '\n', answer)
                        answer = answer.strip()
                    else:
                        # Fallback: use remaining content as answer
                        lines = [line.strip() for line in block.split('\n') if line.strip()]
                        answer = '\n'.join(lines[2:]) if len(lines) > 2 else "Please refer to the course material for the answer."
                    
                    if question and answer and len(question) > 10:
                        exercises.append({
                            "question": question,
                            "answer": answer,
                            "type": f"Exercise {i}",
                            "difficulty": self._determine_difficulty(i)
                        })
                        
                except Exception as e:
                    logger.warning(f"Failed to parse exercise {i}: {e}")
                    continue
        
        # Enhanced fallback: only if no exercises were parsed at all
        if not exercises and exercises_text and len(exercises_text.strip()) > 50:
            logger.warning("Failed to parse exercises, creating fallback exercises")
            # Try to extract any questions from the raw text
            question_patterns = [
                r'Question:\s*(.*?)(?=Answer:|$)',
                r'\?\s*\n',  # Look for question marks
                r'قارن|اشرح|ما هو|كيف|لماذا',  # Arabic question words
                r'Compare|Explain|What is|How|Why'  # English question words
            ]
            
            # Split text into sentences and look for questions
            sentences = re.split(r'[.!?]\s+', exercises_text)
            potential_exercises = []
            
            for sentence in sentences:
                if len(sentence.strip()) > 20:
                    # Check if this looks like a question
                    is_question = (
                        '?' in sentence or 
                        any(re.search(pattern, sentence, re.IGNORECASE) for pattern in question_patterns)
                    )
                    
                    if is_question:
                        # This sentence might be a question, try to find its answer
                        question = sentence.strip()
                        # Look for content after this sentence as potential answer
                        remaining_text = exercises_text[exercises_text.find(sentence) + len(sentence):].strip()
                        answer_part = remaining_text.split('.')[0:3]  # Take next 3 sentences
                        answer = '. '.join(answer_part).strip()
                        
                        if len(answer) > 20:
                            potential_exercises.append({
                                "question": question,
                                "answer": answer,
                                "type": f"Exercise {len(potential_exercises) + 1}",
                                "difficulty": "Medium"
                            })
            
            # If we found potential exercises, use them
            if potential_exercises:
                exercises = potential_exercises[:3]
            else:
                # Last resort: create a single generic exercise
                exercises = [
                    {
                        "question": "Based on the provided content, analyze and explain the key concepts presented.",
                        "answer": exercises_text.strip()[:500] + "..." if len(exercises_text) > 500 else exercises_text.strip(),
                        "type": "Exercise 1",
                        "difficulty": "Medium"
                    }
                ]
        
        # Ensure we have at least 1 exercise
        if not exercises:
            exercises = [
                {
                    "question": "Based on the provided content, what are the key learning objectives?",
                    "answer": "Please review the content carefully and identify the main concepts, theories, and practical applications discussed.",
                    "type": "Exercise 1",
                    "difficulty": "Basic"
                }
            ]
        
        return exercises[:5]  # Limit to 5 exercises
    
    def _determine_difficulty(self, exercise_number: int) -> str:
        """Determine difficulty based on exercise number."""
        if exercise_number <= 2:
            return "Basic"
        elif exercise_number <= 3:
            return "Medium"
        else:
            return "Advanced"
    
    def _split_into_chunks(self, text: str, num_chunks: int) -> List[str]:
        """Split text into approximately equal chunks."""
        words = text.split()
        chunk_size = max(1, len(words) // num_chunks)
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks

# Global Gemini service instance
gemini_service = GeminiService()
