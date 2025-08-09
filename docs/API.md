# API Documentation

QuickReflex provides a RESTful API for data management and integration with external systems.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, the API uses session-based authentication. Future versions may include API key authentication for research integrations.

## Endpoints

### Profiles

#### Create Profile
```http
POST /api/profiles
Content-Type: application/json

{
  "name": "Participant 001",
  "email": "participant@example.com",
  "age": 25,
  "gender": "female",
  "handedness": "right",
  "sportsBackground": "tennis"
}
```

#### Get Profiles
```http
GET /api/profiles
```

#### Update Profile
```http
PATCH /api/profiles/:id
Content-Type: application/json

{
  "refreshRateHz": 60,
  "touchSamplingHz": 120,
  "deviceLatencyOffsetMs": 12.5,
  "calibrationTimestamp": "2025-01-09T15:30:00Z"
}
```

### Test Sessions

#### Create Test Session
```http
POST /api/sessions
Content-Type: application/json

{
  "profileId": "uuid-here",
  "testType": "GO_NO_GO",
  "stimulusType": "visual",
  "metadata": {
    "configuration": {
      "totalTrials": 40,
      "practiceTrials": 8,
      "isiMin": 1500,
      "isiMax": 3000
    }
  }
}
```

#### Get Sessions
```http
GET /api/sessions?profileId=uuid-here&limit=10
```

#### Complete Session
```http
PATCH /api/sessions/:id
Content-Type: application/json

{
  "status": "completed",
  "completedAt": "2025-01-09T15:45:00Z"
}
```

### Trials

#### Record Trial
```http
POST /api/trials
Content-Type: application/json

{
  "sessionId": "uuid-here",
  "trialNumber": 1,
  "stimulusType": "visual",
  "stimulusDetail": "go",
  "cueTimestamp": 1641739200000,
  "responseTimestamp": 1641739200350,
  "rtRaw": 350,
  "rtCorrected": 337.5,
  "excludedFlag": false,
  "exclusionReason": null,
  "isPractice": false,
  "accuracy": true
}
```

#### Get Trials
```http
GET /api/trials?sessionId=uuid-here
```

#### Update Trial
```http
PATCH /api/trials/:id
Content-Type: application/json

{
  "excludedFlag": true,
  "exclusionReason": "Outlier (2.5σ rule)"
}
```

### Results

#### Get Results Summary
```http
GET /api/results/:sessionId
```

Response:
```json
{
  "sessionId": "uuid-here",
  "type": "GO_NO_GO",
  "stimulusType": "visual",
  "completedAt": "2025-01-09T15:45:00Z",
  "meanRT": 425.3,
  "sdRT": 67.8,
  "validTrials": 28,
  "outliers": 4,
  "accuracy": 92.5,
  "trials": [...]
}
```

## Data Types

### Profile
```typescript
interface Profile {
  id: string;
  name: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  handedness?: 'left' | 'right' | 'ambidextrous';
  sportsBackground?: string;
  refreshRateHz?: number;
  touchSamplingHz?: number;
  deviceLatencyOffsetMs?: number;
  calibrationTimestamp?: Date;
  deviceInfoString?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Test Session
```typescript
interface TestSession {
  id: string;
  profileId: string;
  testType: 'SRT' | 'CRT_2' | 'CRT_4' | 'GO_NO_GO';
  stimulusType: 'visual' | 'auditory' | 'tactile';
  startedAt: Date;
  completedAt?: Date;
  metadata?: object;
  status: 'in_progress' | 'completed' | 'abandoned';
}
```

### Trial
```typescript
interface Trial {
  id: string;
  sessionId: string;
  trialNumber: number;
  stimulusType: 'visual' | 'auditory' | 'tactile';
  stimulusDetail: string;
  cueTimestamp: number;
  responseTimestamp?: number;
  rtRaw?: number;
  rtCorrected?: number;
  excludedFlag: boolean;
  exclusionReason?: string;
  isPractice: boolean;
  accuracy?: boolean;
  createdAt: Date;
}
```

## Error Responses

```json
{
  "error": "Validation Error",
  "message": "Invalid trial data",
  "details": {
    "field": "rtRaw",
    "issue": "Must be a positive number"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per session

## Data Export

### Bulk Export
```http
GET /api/export/:sessionId?format=csv
```

Supported formats:
- `csv` - Comma-separated values
- `json` - JSON format
- `spss` - SPSS syntax file

## Webhooks

For research integrations, QuickReflex can send webhooks on session completion:

```http
POST https://your-endpoint.com/webhook
Content-Type: application/json

{
  "event": "session.completed",
  "sessionId": "uuid-here",
  "profileId": "uuid-here",
  "completedAt": "2025-01-09T15:45:00Z",
  "summary": {
    "meanRT": 425.3,
    "validTrials": 28,
    "accuracy": 92.5
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const QuickReflexAPI = require('quickreflex-sdk');

const client = new QuickReflexAPI({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
});

// Create a test session
const session = await client.sessions.create({
  profileId: 'participant-001',
  testType: 'GO_NO_GO',
  stimulusType: 'visual'
});

// Record a trial
await client.trials.create({
  sessionId: session.id,
  trialNumber: 1,
  rtRaw: 350,
  accuracy: true
});
```

### Python
```python
import quickreflex

client = quickreflex.Client(
    base_url='https://your-domain.com/api',
    api_key='your-api-key'
)

# Get results
results = client.results.get(session_id='uuid-here')
print(f"Mean RT: {results.mean_rt}ms")
```

## Research Integration

For large-scale research studies, consider:

1. **Batch Processing**: Use bulk endpoints for efficiency
2. **Data Validation**: Implement client-side validation
3. **Error Handling**: Robust retry logic for network issues
4. **Caching**: Cache calibration data for offline studies
5. **Privacy**: Ensure GDPR/HIPAA compliance for participant data

## Future API Features

- Real-time data streaming via WebSockets
- Advanced statistical endpoints
- Multi-study management
- Participant recruitment integration
- Data anonymization tools