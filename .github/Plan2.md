## Plan: AI Property Recommendation Assistant

This plan adds a conversational recommendation assistant to MoveEase SG without changing the core multi-page architecture. The assistant will capture natural-language property requests, convert them into structured search criteria, query the property catalog, score and rank results, and present the top suggestions with human-readable explanations.

### Scope
- Add a chat-style assistant experience that works as a companion to the existing homepage, search experience, and property detail experience.
- Keep the implementation modular and reusable inside the existing vanilla HTML/CSS/JavaScript structure.
- Use the current property data model and extend it with preference parsing, scoring, and explanation generation.
- Keep the feature usable even before a full AI backend is available by supporting a fallback local parser and rule-based scoring path.
- Support multi-turn conversations where users can refine or change their property requirements without repeating the whole request.

### New UI components required
- Assistant launcher on the homepage hero area and search page.
- Chat panel with message list, user input field, send button, and typing indicator.
- Recommendation results panel showing ranked property cards with Match Score, Assistant Confidence Score, short explanation, and “View Details” action.
- Recommendation Insights section on each property card highlighting concise reasons such as best value, closest location match, largest floor area, most amenities, nearest MRT, newest property, or featured recommendation.
- Match Score Breakdown section on each property card showing contribution details for Location, Property Type, Budget, Bedrooms, Facilities, and Nearby Amenities.
- Alternative recommendations section that appears when no exact matches satisfy all hard requirements.
- Preference chips or summary bar showing extracted criteria such as location, budget, bedrooms, and facilities.
- Assistant confidence summary card showing the overall confidence score, status, and a short explanation of why the confidence is high or low.
- Follow-up prompt suggestions such as “Make it more affordable” or “Add a pool”.
- Optional compact “Why this matches” section on property detail pages.

### Backend API endpoints required
- POST /api/assistant/parse
  - Accepts natural-language input and returns structured user preferences.
- POST /api/assistant/recommend
  - Accepts structured preferences and returns ranked property recommendations.
- POST /api/assistant/refine
  - Accepts the previous chat context plus a new user message and returns updated preferences and recommendations.
- GET /api/assistant/suggestions
  - Optional endpoint to return follow-up prompt suggestions based on user context.
- Existing search endpoint can be reused as a fallback for property retrieval, but the assistant should use a dedicated recommendation endpoint for scoring and explanation.

### JavaScript functions (function signatures only)
- initAssistantFeature(): void
- initAssistantLauncher(): void
- initAssistantChat(): void
- handleAssistantSubmit(event: Event): void
- handleAssistantMessage(message: string): Promise<void>
- parseUserPreferences(input: string): Promise<UserPreferences>
- mergePreferenceUpdates(existingPreferences: UserPreferences, newPreferences: UserPreferences): UserPreferences
- evaluatePreferenceConfidence(preferences: UserPreferences): Array<{field: string, confidence: number, requiresClarification: boolean}>
- calculateAssistantConfidence(preferences: UserPreferences, clarificationRequired: boolean): {score: number, status: string, explanation: string, factors: Array<{name: string, score: number, detail: string}>}
- generateAssistantConfidenceExplanation(confidenceResult: Object): string
- requestClarificationForUncertainPreferences(preferences: UserPreferences): string
- buildSearchCriteria(preferences: UserPreferences): Object
- filterPropertiesByHardRequirements(properties: Property[], requirements: Object): Property[]
- searchRecommendedProperties(criteria: Object): Promise<PropertyRecommendationResult[]>
- scoreProperty(property: Property, preferences: UserPreferences): number
- scoreSoftPreferences(property: Property, preferences: UserPreferences): number
- scoreLocationMatch(property: Property, preferences: UserPreferences): number
- scorePropertyTypeMatch(property: Property, preferences: UserPreferences): number
- scoreBedroomMatch(property: Property, preferences: UserPreferences): number
- scoreBudgetMatch(property: Property, preferences: UserPreferences): number
- scoreFacilityMatch(property: Property, preferences: UserPreferences): number
- scoreAmenityMatch(property: Property, preferences: UserPreferences): number
- buildMatchScoreBreakdown(property: Property, preferences: UserPreferences): Array<{criterion: string, weight: number, score: number, contribution: number, status: string}>
- generateRecommendationInsights(property: Property, preferences: UserPreferences): string[]
- analyseHardRequirementFailures(requirements: Object, properties: Property[]): Array<{requirement: string, reason: string, suggestedAdjustment: string}>
- generateAlternativeRecommendations(preferences: UserPreferences, properties: Property[], failedRequirements: Array<Object>): PropertyRecommendationResult[]
- rankProperties(properties: Property[], preferences: UserPreferences): PropertyRecommendationResult[]
- generateRecommendationExplanation(property: Property, preferences: UserPreferences): string
- generateAlternativeExplanation(property: Property, preferences: UserPreferences, failedRequirements: Array<Object>): string
- renderAssistantConversation(messages: Array): void
- renderRecommendationResults(results: PropertyRecommendationResult[]): void
- updateAssistantState(patch: Object): void
- persistAssistantSession(): void
- restoreAssistantSession(): void

### Application state required
- assistantOpen: boolean
- conversationHistory: Array<{role: string, content: string, timestamp: string}>
- currentPreferences: UserPreferences | null
- currentRecommendations: PropertyRecommendationResult[]
- assistantConfidenceScore: number | null
- assistantConfidenceStatus: string | null
- assistantConfidenceExplanation: string | null
- assistantConfidenceFactors: Array<Object>
- activeChatSessionId: string | null
- isAssistantLoading: boolean
- pendingClarificationField: string | null
- pendingClarificationContext: Object | null
- selectedPropertyId: string | null
- lastSearchContext: Object

### JSON structure used for extracted user preferences
- Example shape:
  {
    "rawInput": "I want a 4 room condominium in Yishun with a 50m swimming pool, close to an MRT station and under $1.5 million.",
    "intent": "property_recommendation",
    "clarificationNeeded": false,
    "clarificationThreshold": 0.75,
    "assistantConfidence": {
      "score": 0.86,
      "status": "high",
      "explanation": "Most important preferences were extracted clearly, but the preferred location was slightly ambiguous.",
      "factors": [
        {
          "name": "preferenceCompleteness",
          "score": 0.9,
          "detail": "Budget, property type, and bedroom needs were clearly captured."
        },
        {
          "name": "ambiguity",
          "score": 0.8,
          "detail": "The preferred district was slightly ambiguous."
        },
        {
          "name": "clarificationRequired",
          "score": 0.7,
          "detail": "A short follow-up was needed for the exact location."
        }
      ]
    },
    "hardRequirements": {
      "location": {
        "value": "Yishun",
        "confidence": 0.95
      },
      "propertyType": {
        "value": "Condo",
        "confidence": 0.92
      },
      "bedrooms": {
        "min": 4,
        "confidence": 0.9
      },
      "budget": {
        "max": 1500000,
        "currency": "SGD",
        "confidence": 0.96
      }
    },
    "softPreferences": {
      "facilities": [
        {
          "name": "swimming_pool",
          "value": true,
          "confidence": 0.94
        },
        {
          "name": "gym",
          "value": true,
          "confidence": 0.82
        }
      ],
      "nearbyAmenities": [
        {
          "name": "mrt",
          "distance": 1,
          "unit": "km",
          "confidence": 0.9
        },
        {
          "name": "school",
          "confidence": 0.75
        }
      ],
      "floorArea": {
        "min": 1000,
        "confidence": 0.75
      },
      "developer": {
        "value": "Apex Homes",
        "confidence": 0.6
      },
      "propertyAge": {
        "max": 10,
        "confidence": 0.65
      }
    },
    "mustHave": ["swimming_pool", "mrt"],
    "niceToHave": ["gym", "nearby_park"],
    "uncertainFields": [
      "location"
    ]
  }

### Property scoring algorithm and weighting strategy
- The recommendation workflow should use a two-stage process:
  1. Hard requirements filtering
  2. Soft preference scoring and ranking
- Hard requirements are used to filter properties before scoring. Properties that fail any hard requirement should be excluded from the recommendation results entirely.
- Examples of hard requirements:
  - Property type
  - Location
  - Maximum budget
  - Minimum number of bedrooms
- Soft preferences are used only after the hard-requirement filter passes. They contribute to the Match Score.
- Examples of soft preferences:
  - Swimming pool
  - Gym
  - BBQ pit
  - Tennis court
  - Near MRT
  - Near shopping mall
  - Near schools
  - Floor area
  - Developer
  - Property age
- Recommended weighting strategy for soft preferences:
  - Location match: 30%
  - Property type match: 20%
  - Bedroom match: 15%
  - Budget fit: 20%
  - Facility match: 10%
  - Nearby amenity match: 5%
- Score formula:
  - totalScore = 0.30 * locationScore + 0.20 * typeScore + 0.15 * bedroomScore + 0.20 * budgetScore + 0.10 * facilityScore + 0.05 * amenityScore
- Each component should be normalised to a 0 to 1 scale.
- Small bonuses may be added for exact matches and penalties may be applied for missing must-have soft features.
- Only properties that satisfy all hard requirements should be passed to the scoring stage.
- Final displayed scores should be rounded to a percentage between 0 and 100.
- Each recommendation should include a Match Score Breakdown showing the weighted contribution of each criterion and whether it was fully matched, partially matched, or not matched.

### Recommendation explanation strategy
- Build explanations from the strongest matched criteria rather than generic text.
- Use a structured explanation engine with evidence from the property and the user preferences.
- Every recommendation should include the following concise feedback:
  - Overall Match Score as a percentage.
  - A short summary explaining why the property is recommended.
  - Recommendation Insights that highlight standout strengths such as best value for money, closest location match, largest floor area within budget, most amenities, nearest MRT, newest property, or featured recommendation.
  - A Match Score Breakdown for Location, Property Type, Budget, Bedrooms, Facilities, and Nearby Amenities.
  - A list of matched requirements.
  - A list of partially matched requirements.
  - Any missing or compromised requirements.
  - Suggestions that may improve the recommendation if suitable alternatives exist.
- When no exact matches satisfy all hard requirements, the assistant should explain which requirement blocked the search and provide realistic alternative adjustments such as increasing budget, expanding the location radius, reducing bedrooms, or relaxing facilities.
- Alternative recommendations should be displayed separately from exact matches and clearly labelled as suggested alternatives.
- The explanation should remain natural and personalised, not just a list of keywords.
- The summary should be based directly on the user's extracted preferences and the property's attributes.
- Example explanation:
  - “This condo is a strong match because it fits your budget and preferred district, and it includes a swimming pool. It is slightly below your preferred bedroom count, so a larger unit or a nearby alternative could improve the fit.”

### Assistant Confidence Score strategy
- The Assistant Confidence Score measures how confident the assistant is in understanding the user's request.
- It is separate from the Property Match Score and should not be confused with ranking quality.
- It should be calculated using the following factors:
  - Confidence values of extracted preferences.
  - Number of ambiguous or missing preferences.
  - Whether clarification was required.
  - Completeness of the extracted preference model.
- The score should be displayed as a percentage and paired with a short explanation.
- High confidence should be used when all important preferences are clearly extracted and the request is complete.
- Lower confidence should be used when locations, budgets, property types, or other core preferences are ambiguous or incomplete.
- The assistant should show a short explanation such as:
  - “High confidence because the budget, property type, and bedroom needs were extracted clearly.”
  - “Lower confidence because the preferred location and ideal budget were ambiguous.”

### Overall recommendation workflow
1. User enters a natural language property request.
2. The AI extracts structured user preferences.
3. Confidence values for the extracted preferences are evaluated.
4. The assistant calculates an Assistant Confidence Score using preference confidence, ambiguity, missing fields, clarification need, and completeness.
5. If confidence is low, the assistant asks the user for clarification.
6. The extracted preferences are converted into structured search parameters.
7. The backend property search API retrieves candidate properties.
8. Hard requirements are applied to filter unsuitable properties.
9. The recommendation engine calculates Match Scores for the remaining properties using weighted soft preferences.
10. Properties are ranked from highest to lowest Match Score.
11. The AI generates personalised recommendation explanations.
11. If no exact matches satisfy all hard requirements, the assistant analyses the blocking criteria, suggests practical alternatives, and produces a separate group of alternative recommendations.
12. The frontend displays the ranked recommendations together with Assistant Confidence Score, Match Scores, explanations, and links to the property details page.
13. The frontend clearly labels alternative recommendations as suggested alternatives and explains why they were generated.
14. Users may refine their search through follow-up chat messages, and the assistant repeats the recommendation workflow while preserving the existing conversation context.

### Confidence-based clarification workflow
- After extracting structured preferences, the assistant should evaluate the confidence of each recognised field.
- If any extracted field falls below the acceptable threshold, the assistant should pause the search and ask the user for clarification before proceeding.
- The clarification threshold should be configurable, for example 0.75.
- Example:
  - User says: “somewhere in the north”
  - Assistant should ask: “Do you mean Yishun, Woodlands, Sembawang, or another area in the north?”
- Clarification should be conversational and should allow the user to answer with a short follow-up message.
- Once the user responds, the assistant should merge the clarification into the existing preference model and re-evaluate whether the search can proceed.
- The assistant should not execute the property search until all high-priority hard requirements meet the confidence threshold.

### Multi-turn conversation and refinement workflow
- The assistant should maintain the full conversation history for the active chat session.
- Each new user message should be interpreted as either:
  - A new property request,
  - A refinement to the existing preferences, or
  - A clarification response to a previous assistant question.
- The assistant should update the stored user preferences rather than replacing them wholesale.
- Examples of refinements:
  - “Increase my budget to $1.8 million.”
  - “Only show freehold properties.”
  - “Remove the swimming pool requirement.”
  - “Show properties closer to an MRT station.”
  - “Add a gym.”
- When a refinement is detected, the assistant should:
  1. Update the current preference model.
  2. Rebuild the search criteria.
  3. Perform a new recommendation search.
  4. Recalculate Match Scores.
  5. Render updated recommendations.
  6. Preserve the conversation history and show the change clearly to the user.
- The assistant should preserve prior preferences unless a new message explicitly removes or overrides them.
- The same workflow should apply when the user asks for a broader or narrower search after initial recommendations are shown.

### Integration with existing pages
- Homepage
  - Add an assistant entry point near the hero search panel.
  - Allow users to start a new recommendation chat directly from the homepage.
- Search page
  - Add the assistant as a side panel or expandable section beside the filters.
  - Allow generated recommendations to prefill or update the search filters.
  - Link each recommendation card directly to the property details page.
- Property details page
  - Add a small “Why this matches your search” section using the assistant-generated explanation.
  - Allow users to ask the assistant whether this property fits a different preference.

### Logical implementation order
1. Define the assistant data contract and API contract with the backend team.
2. Add the assistant UI shell and chat state in the existing shared JavaScript and CSS foundation.
3. Implement preference parsing and structured preference conversion with confidence scoring.
4. Implement confidence evaluation and clarification-trigger logic.
5. Implement preference merge and update logic for follow-up messages.
6. Implement property filtering, weighted scoring, and ranking logic.
7. Implement recommendation explanation generation and result rendering.
8. Integrate the assistant with the homepage, search page, and property details page.
9. Add multi-turn refinement handling, clarification handling, and fallback behaviour for unavailable backend responses.
10. Verify the experience with realistic example prompts, ranking quality, and UI responsiveness.
