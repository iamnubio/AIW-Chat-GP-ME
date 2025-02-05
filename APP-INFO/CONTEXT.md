# Context Documentation

## OpenAIContext

The OpenAIContext provides global state management for OpenAI API interactions and assistant configuration.

### State Interface

```typescript
interface OpenAIState {
  isConnected: boolean;
  client: OpenAI | null;
  assistants: Assistant[];
  selectedAssistant: Assistant | null;
  availableModels: string[];
}
```

### Actions

```typescript
type OpenAIAction =
  | { type: 'CONNECT'; payload: OpenAI }
  | { type: 'SET_ASSISTANTS'; payload: Assistant[] }
  | { type: 'SELECT_ASSISTANT'; payload: Assistant }
  | { type: 'ADD_ASSISTANT'; payload: Assistant }
  | { type: 'SET_MODELS'; payload: string[] }
  | { type: 'DISCONNECT' };
```

### Provider Methods

#### connect
```typescript
const connect = async (apiKey: string) => {
  // Initializes OpenAI client
  // Fetches available models
  // Retrieves existing assistants
};
```

#### selectAssistant
```typescript
const selectAssistant = (assistant: Assistant) => {
  // Updates selected assistant in state
};
```

#### createAssistant
```typescript
const createAssistant = async (data: {
  name: string;
  instructions: string;
  model: string;
}) => {
  // Creates new assistant via API
  // Updates state with new assistant
};
```

#### proceedToChat
```typescript
const proceedToChat = (navigate: (path: string) => void) => {
  // Handles navigation to chat interface
};
```

### Usage Example

```typescript
import { useOpenAI } from '../context/OpenAIContext';

function MyComponent() {
  const { state, connect, selectAssistant } = useOpenAI();
  
  // Access state and methods
}
```

### State Management Flow

1. Initial Connection
   - User provides API key
   - Connection established
   - Models and assistants fetched

2. Assistant Selection
   - User selects or creates assistant
   - State updated
   - Navigation triggered

3. Chat Interaction
   - Messages handled through context
   - Thread management
   - Real-time updates

### Error Handling

```typescript
try {
  // API operations
} catch (error) {
  // Error handling
  throw error; // Propagate to components
}
```

### Best Practices

1. State Updates
   - Use reducer for predictable updates
   - Maintain immutability
   - Handle loading states

2. Error Management
   - Proper error propagation
   - User-friendly messages
   - State recovery

3. Type Safety
   - Strong typing for all operations
   - Interface definitions
   - Runtime checks

4. Performance
   - Efficient state updates
   - Proper memoization
   - Optimized re-renders
