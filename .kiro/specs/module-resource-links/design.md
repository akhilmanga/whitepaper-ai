# Design Document

## Overview

The Module Resource Links feature automatically curates and displays relevant external learning resources for each course module. The system leverages AI-powered content analysis to discover high-quality resources (articles, videos, documentation, tutorials) that complement the module content, providing learners with deeper understanding opportunities.

The feature integrates seamlessly into the existing course structure, extending the current Module interface with a resources field and adding new API endpoints for resource management.

## Architecture

### High-Level Flow
1. **Course Generation Completion** → Triggers resource curation pipeline
2. **Content Analysis** → Extract key topics and concepts from each module
3. **Resource Discovery** → Search multiple sources for relevant content
4. **Quality Filtering** → Score and filter resources based on relevance and quality
5. **Storage** → Save curated resources to database
6. **Display** → Show resources in module UI with engagement tracking

### System Components
- **Resource Curation Service**: Core AI-powered curation logic
- **Resource Discovery Adapters**: Pluggable adapters for different content sources
- **Quality Scoring Engine**: Evaluates resource relevance and quality
- **Resource Storage**: Database layer for persisting resources
- **Resource API**: REST endpoints for resource management
- **Resource UI Components**: Frontend components for displaying resources

## Components and Interfaces

### Data Models

#### Resource Interface (Frontend)
```typescript
interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: 'article' | 'video' | 'documentation' | 'tutorial' | 'course'
  source: string // e.g., 'Medium', 'YouTube', 'GitHub'
  relevanceScore: number
  estimatedReadTime?: number // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  createdAt: string
  visited?: boolean // user-specific, populated on frontend
}

interface ModuleResources {
  moduleId: string
  resources: Resource[]
  lastUpdated: string
  curationStatus: 'pending' | 'completed' | 'failed'
}
```

#### Extended Module Interface
```typescript
interface Module {
  // ... existing fields
  resources?: ModuleResources
}
```

#### Database Schema (MongoDB)
```javascript
// New collection: module_resources
{
  _id: ObjectId,
  moduleId: string,
  courseId: string,
  resources: [
    {
      id: string,
      title: string,
      description: string,
      url: string,
      type: string,
      source: string,
      relevanceScore: number,
      estimatedReadTime: number,
      difficulty: string,
      tags: [string],
      createdAt: Date
    }
  ],
  lastUpdated: Date,
  curationStatus: string
}

// New collection: user_resource_interactions
{
  _id: ObjectId,
  userId: string,
  courseId: string,
  moduleId: string,
  resourceId: string,
  visited: boolean,
  visitedAt: Date,
  timeSpent: number // in seconds
}
```

### Resource Curation Service

#### Core Curation Pipeline
```python
class ResourceCurationService:
    def __init__(self):
        self.content_analyzer = ContentAnalyzer()
        self.discovery_adapters = [
            WebSearchAdapter(),
            YouTubeAdapter(),
            GitHubAdapter(),
            MediumAdapter()
        ]
        self.quality_scorer = QualityScorer()
    
    async def curate_resources(self, module: Dict) -> List[Resource]:
        # 1. Extract key topics from module content
        topics = await self.content_analyzer.extract_topics(module['content'])
        
        # 2. Discover resources from multiple sources
        raw_resources = []
        for adapter in self.discovery_adapters:
            resources = await adapter.search(topics, limit=10)
            raw_resources.extend(resources)
        
        # 3. Score and filter resources
        scored_resources = []
        for resource in raw_resources:
            score = await self.quality_scorer.score_resource(resource, topics)
            if score >= 0.6:  # Minimum relevance threshold
                resource['relevanceScore'] = score
                scored_resources.append(resource)
        
        # 4. Deduplicate and rank
        unique_resources = self._deduplicate(scored_resources)
        return sorted(unique_resources, key=lambda x: x['relevanceScore'], reverse=True)[:8]
```

#### Discovery Adapters
```python
class WebSearchAdapter:
    async def search(self, topics: List[str], limit: int) -> List[Dict]:
        # Use search APIs (Google Custom Search, Bing, etc.)
        pass

class YouTubeAdapter:
    async def search(self, topics: List[str], limit: int) -> List[Dict]:
        # Use YouTube Data API
        pass

class GitHubAdapter:
    async def search(self, topics: List[str], limit: int) -> List[Dict]:
        # Search GitHub repositories and documentation
        pass
```

### API Endpoints

#### New Endpoints
```python
# Trigger resource curation (called after course generation)
@app.post("/api/courses/{course_id}/curate-resources")
async def curate_course_resources(course_id: str)

# Get resources for a specific module
@app.get("/api/courses/{course_id}/modules/{module_id}/resources")
async def get_module_resources(course_id: str, module_id: str)

# Track resource interaction
@app.post("/api/courses/{course_id}/modules/{module_id}/resources/{resource_id}/visit")
async def track_resource_visit(course_id: str, module_id: str, resource_id: str)

# Retry resource curation for a module
@app.post("/api/courses/{course_id}/modules/{module_id}/resources/retry")
async def retry_resource_curation(course_id: str, module_id: str)
```

### Frontend Components

#### ResourceSection Component
```typescript
interface ResourceSectionProps {
  moduleId: string
  courseId: string
}

const ResourceSection: React.FC<ResourceSectionProps> = ({ moduleId, courseId }) => {
  const [resources, setResources] = useState<ModuleResources | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Load resources, handle loading states, group by type
  // Display resources with type icons and visit tracking
}
```

#### ResourceCard Component
```typescript
interface ResourceCardProps {
  resource: Resource
  onVisit: (resourceId: string) => void
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onVisit }) => {
  // Display resource with title, description, type icon, estimated time
  // Handle click tracking and external link opening
}
```

## Data Models

### Resource Types and Sources
- **Articles**: Medium, Dev.to, personal blogs, news sites
- **Videos**: YouTube, Vimeo, educational platforms
- **Documentation**: Official docs, GitHub wikis, API references
- **Tutorials**: Interactive tutorials, code examples, step-by-step guides

### Quality Scoring Factors
1. **Relevance Score** (0-1): Semantic similarity to module topics
2. **Authority Score** (0-1): Source credibility and domain authority
3. **Freshness Score** (0-1): Content recency and update frequency
4. **Engagement Score** (0-1): Social signals, views, ratings
5. **Accessibility Score** (0-1): Content readability and structure

### Content Analysis Pipeline
1. **Topic Extraction**: Use NLP to identify key concepts from module content
2. **Keyword Generation**: Generate search terms and synonyms
3. **Context Understanding**: Analyze module difficulty and learning objectives
4. **Semantic Matching**: Compare discovered content with module topics

## Error Handling

### Curation Failures
- **Network Issues**: Retry with exponential backoff
- **API Rate Limits**: Queue requests and respect rate limits
- **Content Quality Issues**: Log low-quality resources for review
- **No Resources Found**: Display helpful message with manual search option

### User Experience
- **Loading States**: Show skeleton loaders during curation
- **Retry Mechanisms**: Allow users to retry failed curation
- **Fallback Content**: Suggest general learning resources if specific ones fail
- **Error Messages**: Clear, actionable error messages

### Monitoring and Logging
```python
# Log curation metrics
logger.info(f"Resource curation completed", extra={
    "course_id": course_id,
    "module_id": module_id,
    "resources_found": len(resources),
    "processing_time": processing_time,
    "average_relevance_score": avg_score
})

# Track quality metrics
metrics.histogram("resource_curation.processing_time", processing_time)
metrics.counter("resource_curation.resources_found", len(resources))
metrics.gauge("resource_curation.average_quality", avg_score)
```

## Testing Strategy

### Unit Tests
- **Content Analysis**: Test topic extraction accuracy
- **Quality Scoring**: Verify scoring algorithm correctness
- **Discovery Adapters**: Mock API responses and test parsing
- **Deduplication**: Test duplicate detection logic

### Integration Tests
- **End-to-End Curation**: Test complete pipeline with real content
- **API Endpoints**: Test all resource-related endpoints
- **Database Operations**: Test resource storage and retrieval
- **User Interactions**: Test visit tracking and progress updates

### Performance Tests
- **Curation Speed**: Ensure reasonable processing times
- **Concurrent Requests**: Test system under load
- **Memory Usage**: Monitor memory consumption during curation
- **API Rate Limits**: Test adapter behavior with rate limiting

### Quality Assurance
- **Resource Relevance**: Manual review of curated resources
- **Content Appropriateness**: Ensure family-friendly content
- **Link Validity**: Regular checks for broken links
- **User Feedback**: Collect and analyze user ratings

### Test Data
- **Sample Modules**: Create test modules with known good resources
- **Mock APIs**: Mock external service responses for consistent testing
- **Quality Benchmarks**: Establish minimum quality thresholds
- **User Scenarios**: Test different user interaction patterns