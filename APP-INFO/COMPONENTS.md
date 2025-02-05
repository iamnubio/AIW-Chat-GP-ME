# Component Documentation

## Core Components

### ChatInterface.tsx

The main chat interface component that handles all chat-related functionality.

#### Props
None - Uses context for state management

#### Key Features
- Real-time message handling
- Automatic greeting system
- Thread management
- Loading states
- Error handling
- Message history
- Auto-scrolling

#### State Management
```typescript
interface Message {
  content: string;
  role: 'assistant' | 'user';
}

const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [threadId, setThreadId] = useState<string | null>(null);
```

#### Key Methods
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Handles message submission
};

const scrollToBottom = () => {
  // Manages chat scroll behavior
};
```

### Layout.tsx

Provides consistent layout structure across all pages.

#### Props
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

#### Features
- Responsive navigation
- Side menu
- Header
- Content area
- Mouse glow effect

#### Menu Structure
```typescript
const menuItems = [
  {
    type: 'section',
    title: 'Chat',
    items: [/* ... */]
  },
  // ...
];
```

### LoginForm.tsx

Handles user authentication and assistant selection.

#### State Management
```typescript
interface CreateAssistantFormData {
  name: string;
  instructions: string;
  model: string;
}

const [apiKey, setApiKey] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

#### Key Features
- API key validation
- Assistant selection
- New assistant creation
- Form validation
- Error handling

## Page Components

### Settings.tsx

Manages assistant configuration and updates.

#### State Management
```typescript
interface AssistantFormData {
  name: string;
  instructions: string;
  model: string;
}
```

#### Features
- Assistant configuration form
- Warning dialogs
- Real-time updates
- Error handling

### Threads.tsx

Displays and manages conversation threads.

#### Interfaces
```typescript
interface Thread {
  id: string;
  created_at: number;
  metadata: {
    title?: string;
  };
}

interface ThreadWithMessages extends Thread {
  messageCount: number;
  lastMessage?: string;
}
```

#### Features
- Thread listing
- Search functionality
- Message counting
- Date formatting
- Loading states

### Tools.tsx

Displays available tools and utilities.

#### Tool Structure
```typescript
const tools = [
  {
    icon: IconComponent,
    name: string,
    description: string,
    comingSoon: boolean
  }
];
```

## Effect Components

### MouseGlow.tsx

Creates an interactive glow effect that follows the mouse cursor.

#### Implementation
```typescript
const [position, setPosition] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  // Event listener setup
});
```

## Component Best Practices

### Performance
1. Use proper dependencies in useEffect
2. Implement useMemo and useCallback where needed
3. Avoid unnecessary re-renders
4. Optimize state updates

### Error Handling
1. Implement try-catch blocks
2. Display user-friendly error messages
3. Use error boundaries
4. Handle edge cases

### Accessibility
1. Use semantic HTML
2. Implement ARIA labels
3. Ensure keyboard navigation
4. Maintain proper contrast

### State Management
1. Use context appropriately
2. Keep state close to usage
3. Implement proper type safety
4. Handle loading states
