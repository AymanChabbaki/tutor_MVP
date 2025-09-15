# API Testing Commands for AI Bootcamp Tutor MVP

## Prerequisites
Make sure your Flask application is running:
```bash
cd c:\Users\HP\Desktop\tutor_MVP
python app.py
```

## Health Check
```bash
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/api/health
```

## Test Content Summarization
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention."
  }'
```

## Test Content Explanation
```bash
curl -X POST http://localhost:5000/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Neural networks are computing systems vaguely inspired by the biological neural networks. They are used to recognize patterns and solve common problems in artificial intelligence."
  }'
```

## Test Exercise Generation
```bash
curl -X POST http://localhost:5000/api/generate_exercises \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Python is a high-level programming language. It was created by Guido van Rossum and first released in 1991. Python is known for its simple syntax and readability."
  }'
```

## User Management
### Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Student",
    "email": "ahmed@example.com",
    "language_pref": "english"
  }'
```

### Get User Sessions
```bash
curl -X GET "http://localhost:5000/api/users/ahmed@example.com/sessions?limit=5"
```

## Test with User ID (to save sessions)
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines.",
    "user_id": 1
  }'
```

## Error Testing
### Test missing required field
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test empty text
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": ""
  }'
```

### Test invalid endpoint
```bash
curl -X GET http://localhost:5000/api/nonexistent
```

### Test wrong method
```bash
curl -X GET http://localhost:5000/api/summarize
```

## PowerShell Examples (Windows)
If you're using PowerShell, you can use Invoke-RestMethod:

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```

### Summarize Content
```powershell
$body = @{
    text = "Machine learning is a subset of artificial intelligence that focuses on algorithms."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/summarize" -Method Post -Body $body -ContentType "application/json"
```

### Create User
```powershell
$user = @{
    name = "Test Student"
    email = "test@example.com"
    language_pref = "english"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Post -Body $user -ContentType "application/json"
```

## Expected Response Formats

### Summarize Response
```json
{
  "summary": "Machine learning automates analytical model building using data patterns...",
  "session_id": 123
}
```

### Explain Response
```json
{
  "arabic_explanation": "الشبكات العصبية هي أنظمة حاسوبية...",
  "english_explanation": "Neural networks are computing systems...",
  "session_id": 124
}
```

### Exercises Response
```json
{
  "exercises": [
    {
      "question": "What is Python?",
      "answer": "Python is a high-level programming language..."
    },
    {
      "question": "Who created Python?",
      "answer": "Python was created by Guido van Rossum..."
    },
    {
      "question": "When was Python first released?",
      "answer": "Python was first released in 1991..."
    }
  ],
  "session_id": 125
}
```

### User Creation Response
```json
{
  "user": {
    "id": 1,
    "name": "Ahmed Student",
    "email": "ahmed@example.com",
    "languagePref": "english",
    "createdAt": "2023-12-01T10:30:00Z"
  }
}
```

## Running Python Test Scripts

### Quick Test
```bash
python quick_test.py
```

### Comprehensive Test
```bash
python test_endpoints.py
```

### Unit Tests
```bash
pytest tests/ -v
```

### Run specific test
```bash
pytest tests/test_api.py::TestSummarizeEndpoint::test_summarize_success -v
```
