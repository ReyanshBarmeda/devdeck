import { Project, AIPrompt, DevSnippet, DevBookmark, PortEntry } from '../types';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-swift-macos',
    name: 'AuraDeck macOS Native (Swift 6 & SwiftUI)',
    description: 'Native macOS menu bar status deck and developer companion app built with Swift 6, SwiftUI Liquid Glass materials, and AppKit vibrancy.',
    category: 'swift-app',
    status: 'active',
    priority: 'urgent',
    localPath: '~/Developer/macOS/AuraDeck',
    workspaceType: 'folder',
    workspaceFile: 'Package.swift',
    githubUrl: 'https://github.com/developer/auradeck-macos',
    githubStars: 2180,
    githubForks: 340,
    githubOpenIssues: 4,
    githubLastCommit: {
      message: 'feat: add SwiftUI Liquid Glass blur materials & AppKit status item',
      author: 'craig-apple',
      date: '2026-08-29T20:10:00Z',
      sha: 'f49a21e',
    },
    defaultBranch: 'main',
    tags: ['swift', 'swiftui', 'macos', 'liquid-glass', 'appkit', 'apple', 'xcode'],
    techStack: ['Swift 6', 'SwiftUI', 'AppKit Vibrancy', 'SPM', 'Observation', 'Combine'],
    aiStack: ['Gemini 3.7 Flash Swift SDK', 'Apple CoreML'],
    vscodeWorkspace: 'AuraDeck.code-workspace',
    color: '#f97316',
    envVariables: [
      { id: 'env-sw-1', key: 'GEMINI_API_KEY', value: 'AIzaSySwiftNativeClientKey402', isSecret: true, description: 'Gemini Swift API key' },
      { id: 'env-sw-2', key: 'MACOS_BUNDLE_ID', value: 'com.developer.AuraDeck', isSecret: false, description: 'Apple Developer App Bundle ID' },
    ],
    scripts: [
      { id: 'scr-sw-1', label: 'Build Swift Package', command: 'swift build -c release', category: 'build', description: 'Compiles native macOS Swift binary' },
      { id: 'scr-sw-2', label: 'Run SwiftUI App', command: 'swift run AuraDeckApp', category: 'dev', description: 'Launches native macOS MenuBar app' },
      { id: 'scr-sw-3', label: 'Test Concurrency', command: 'swift test --parallel', category: 'test', description: 'Executes Swift Testing suite' },
    ],
    tasks: [
      { id: 'tsk-sw-1', title: 'Implement SwiftUI Liquid Glass frosted material background', completed: true, tag: 'UI / Design', priority: 'high' },
      { id: 'tsk-sw-2', title: 'Add Swift 6 Actor network isolation for Gemini endpoints', completed: true, tag: 'Architecture', priority: 'high' },
      { id: 'tsk-sw-3', title: 'Register macOS global command palette hotkey (⌘⇧K)', completed: false, tag: 'AppKit', priority: 'medium' },
      { id: 'tsk-sw-4', title: 'Publish notarized macOS DMG installer on GitHub Releases', completed: false, tag: 'Release', priority: 'high' },
    ],
    notes: '### macOS Swift Architecture\n- Built for macOS 14 Sonoma & macOS 15 Sequoia.\n- Uses `.ultraThinMaterial` and liquid glass refraction borders.',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-29T20:15:00Z',
    isStarred: true,
    lastOpenedAt: '2026-08-29T21:00:00Z',
  },
  {
    id: 'proj-1',
    name: 'NeuralPulse AI Copilot',
    description: 'Real-time multi-modal AI coding assistant & developer analytics with Gemini 3.7 Flash and Live API streaming.',
    category: 'ai',
    status: 'active',
    priority: 'urgent',
    localPath: '~/projects/ai/neuralpulse-copilot',
    workspaceType: 'code-workspace',
    workspaceFile: 'neuralpulse.code-workspace',
    linkedFolders: ['frontend', 'server', 'packages/shared'],
    githubUrl: 'https://github.com/developer/neuralpulse-copilot',
    githubStars: 1420,
    githubForks: 215,
    githubOpenIssues: 7,
    githubLastCommit: {
      message: 'feat: add streaming audio token buffer for Gemini Live API',
      author: 'alex-dev',
      date: '2026-08-29T18:24:00Z',
      sha: 'a89f3c1',
    },
    defaultBranch: 'main',
    liveUrl: 'https://neuralpulse.dev',
    docsUrl: 'https://docs.neuralpulse.dev',
    localPort: 3000,
    tags: ['react', 'typescript', 'machine-learning', 'gemini', 'websockets', 'tailwind', 'fullstack'],
    techStack: ['React 19', 'TypeScript', 'Tailwind v4', 'Express', 'Vite', 'WebSockets'],
    aiStack: ['Gemini 3.7 Flash', 'Google GenAI SDK', 'ChromaDB Vector Store', 'Embeddings 2'],
    vscodeWorkspace: 'neuralpulse.code-workspace',
    color: '#6366f1',
    envVariables: [
      { id: 'env-1', key: 'GEMINI_API_KEY', value: 'AIzaSyDemoKeyExample429X', isSecret: true, description: 'Google AI Studio API key' },
      { id: 'env-2', key: 'PORT', value: '3000', isSecret: false, description: 'Server listening port' },
      { id: 'env-3', key: 'VECTOR_DB_URL', value: 'http://localhost:8000', isSecret: false, description: 'Local ChromaDB endpoint' },
    ],
    scripts: [
      { id: 'scr-1', label: 'Dev Server', command: 'npm run dev', category: 'dev', description: 'Starts Express + Vite on port 3000' },
      { id: 'scr-2', label: 'Run Typecheck', command: 'npm run lint', category: 'test', description: 'Runs TypeScript type checker' },
      { id: 'scr-3', label: 'Vector Store Sync', command: 'python scripts/embed_codebase.py', category: 'db', description: 'Re-index AST chunks' },
    ],
    tasks: [
      { id: 'tsk-1', title: 'Implement WebSocket backpressure for Gemini Live Audio', completed: true, tag: 'Architecture', priority: 'high' },
      { id: 'tsk-2', title: 'Add AST-based token chunker for TypeScript files', completed: true, tag: 'AI Engine', priority: 'medium' },
      { id: 'tsk-3', title: 'Support VS Code Deep Link protocol handler', completed: false, tag: 'Feature', priority: 'high' },
      { id: 'tsk-4', title: 'Write integration benchmark for 24kHz audio playback', completed: false, tag: 'Testing', priority: 'medium' },
    ],
    notes: '### Architecture Notes\n- Uses Gemini 3.7 Flash with streaming tool calls.\n- Keep vector chunks under 512 tokens for sub-50ms latency.',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-29T18:30:00Z',
    isStarred: true,
    lastOpenedAt: '2026-08-29T19:40:00Z',
  },
  {
    id: 'proj-2',
    name: 'OmniVault Cloud Sync',
    description: 'End-to-end encrypted distributed state synchronization engine & developer secret vault.',
    category: 'backend',
    status: 'in_progress',
    priority: 'high',
    localPath: '~/work/security/omnivault-engine',
    workspaceType: 'folder',
    githubUrl: 'https://github.com/developer/omnivault-engine',
    githubStars: 864,
    githubForks: 112,
    githubOpenIssues: 3,
    githubLastCommit: {
      message: 'fix: patch AES-GCM nonce collision boundary condition',
      author: 'sarah-crypto',
      date: '2026-08-28T11:45:00Z',
      sha: '7e2c91b',
    },
    defaultBranch: 'main',
    localPort: 8080,
    tags: ['backend', 'go', 'rust', 'grpc', 'postgresql', 'docker', 'security'],
    techStack: ['Go / Rust', 'gRPC', 'PostgreSQL', 'Docker', 'Redis', 'OAuth2'],
    aiStack: ['Gemini Security Audit Agent'],
    vscodeWorkspace: 'omnivault.code-workspace',
    color: '#06b6d4',
    envVariables: [
      { id: 'env-4', key: 'DATABASE_URL', value: 'postgresql://postgres:pass@localhost:5432/omnivault', isSecret: true, description: 'Postgres connection' },
      { id: 'env-5', key: 'MASTER_ENCRYPTION_SALT', value: 'k9x_secret_salt_3821', isSecret: true, description: 'AES-256-GCM salt' },
    ],
    scripts: [
      { id: 'scr-4', label: 'Docker Compose Up', command: 'docker compose up -d postgres redis', category: 'docker', description: 'Spins up local infrastructure' },
      { id: 'scr-5', label: 'Run Migrations', command: 'go run cmd/migrate/main.go up', category: 'db', description: 'Executes DDL migrations' },
    ],
    tasks: [
      { id: 'tsk-5', title: 'Implement Argon2id key derivation module', completed: true, tag: 'Crypto', priority: 'high' },
      { id: 'tsk-6', title: 'Add Zero-Knowledge proof verification API', completed: false, tag: 'Security', priority: 'high' },
      { id: 'tsk-7', title: 'Write load test script for 10k rps gRPC sync', completed: false, tag: 'DevOps', priority: 'medium' },
    ],
    notes: 'Remember to never commit raw `.env` files. Audit secrets rotation every 30 days.',
    createdAt: '2026-07-20T14:00:00Z',
    updatedAt: '2026-08-28T12:00:00Z',
    isStarred: true,
  },
  {
    id: 'proj-3',
    name: 'Aether Design System',
    description: 'High-density, WCAG AA compliant headless UI component library with Framer Motion primitives.',
    category: 'library',
    status: 'shipped',
    priority: 'medium',
    localPath: '~/github/design/aether-ui',
    workspaceType: 'folder',
    githubUrl: 'https://github.com/developer/aether-ui',
    githubStars: 3250,
    githubForks: 490,
    githubOpenIssues: 12,
    githubLastCommit: {
      message: 'release: publish v2.4.0 with Bento Grid layouts & Command Palette',
      author: 'elena-ui',
      date: '2026-08-20T15:50:00Z',
      sha: '4d10f8a',
    },
    liveUrl: 'https://aether-ui.design',
    localPort: 6006,
    tags: ['react', 'tailwind', 'design-system', 'typescript', 'storybook', 'frontend'],
    techStack: ['React', 'Storybook', 'Tailwind CSS', 'Framer Motion', 'Rollup', 'npm package'],
    aiStack: [],
    color: '#ec4899',
    envVariables: [],
    scripts: [
      { id: 'scr-6', label: 'Run Storybook', command: 'npm run storybook -p 6006', category: 'dev', description: 'Starts component preview' },
      { id: 'scr-7', label: 'Build Package', command: 'npm run build && npm pack', category: 'build', description: 'Builds CJS & ESM bundles' },
    ],
    tasks: [
      { id: 'tsk-8', title: 'Publish v2.4.0 with Command Palette component', completed: true, tag: 'Release', priority: 'high' },
      { id: 'tsk-9', title: 'Write automated visual regression tests in Chromatic', completed: true, tag: 'QA', priority: 'medium' },
    ],
    notes: 'v2.4 published to npm registry successfully.',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-08-20T16:00:00Z',
    isStarred: false,
  },
  {
    id: 'proj-4',
    name: 'DevFlow Git & PR Automator',
    description: 'CLI toolkit and VS Code extension for automated git branching, semantic commits, and PR reviews with AI.',
    category: 'cli',
    status: 'active',
    priority: 'high',
    localPath: '~/projects/cli/devflow-cli',
    workspaceType: 'code-workspace',
    workspaceFile: 'devflow.code-workspace',
    githubUrl: 'https://github.com/developer/devflow-cli',
    githubStars: 620,
    githubForks: 78,
    githubOpenIssues: 2,
    githubLastCommit: {
      message: 'feat: add git rebase conflict AI suggestions helper',
      author: 'marcus-dev',
      date: '2026-08-29T14:10:00Z',
      sha: '9c53ba2',
    },
    defaultBranch: 'main',
    tags: ['cli', 'typescript', 'nodejs', 'git', 'github-api', 'developer-tool'],
    techStack: ['Node.js', 'TypeScript', 'Commander.js', 'Inquirer', 'Octokit'],
    aiStack: ['Gemini 3.7 Flash', 'GitHub Models'],
    vscodeWorkspace: 'devflow.code-workspace',
    color: '#8b5cf6',
    envVariables: [
      { id: 'env-6', key: 'GITHUB_TOKEN', value: 'ghp_developerPersonalAccessTokenExample', isSecret: true, description: 'GitHub CLI & API token' },
    ],
    scripts: [
      { id: 'scr-8', label: 'Build CLI', command: 'npm run build && npm link', category: 'build', description: 'Compiles and symlinks global CLI' },
      { id: 'scr-9', label: 'Run Test Suite', command: 'npm test -- --coverage', category: 'test', description: 'Executes Jest unit tests' },
    ],
    tasks: [
      { id: 'tsk-10', title: 'Add interactive git rebase conflict resolver', completed: false, tag: 'Feature', priority: 'high' },
      { id: 'tsk-11', title: 'Support automated Changelog.md generator', completed: true, tag: 'Feature', priority: 'medium' },
    ],
    notes: 'Global binary installed via `npm link`. Can test using `devflow pr create`.',
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-29T14:15:00Z',
    isStarred: true,
  },
  {
    id: 'proj-5',
    name: 'FastRAG Semantic Document Engine',
    description: 'High-throughput document chunking, hybrid BM25 + dense neural embedding retriever with Gemini grounding.',
    category: 'ai',
    status: 'in_progress',
    priority: 'medium',
    localPath: '~/research/ai/fastrag-python',
    workspaceType: 'folder',
    githubUrl: 'https://github.com/developer/fastrag-python',
    githubStars: 1890,
    githubForks: 240,
    githubOpenIssues: 5,
    githubLastCommit: {
      message: 'perf: accelerate DuckDB hybrid BM25 vector index joins',
      author: 'rachel-ai',
      date: '2026-08-27T09:40:00Z',
      sha: '3b8110e',
    },
    localPort: 5000,
    tags: ['python', 'fastapi', 'machine-learning', 'qdrant', 'gemini', 'rag', 'backend'],
    techStack: ['Python 3.12', 'FastAPI', 'PyTorch', 'Qdrant', 'DuckDB', 'Uvicorn'],
    aiStack: ['Gemini 3.7 Flash', 'Gemini Embedding 2', 'LangChain', 'LlamaIndex'],
    color: '#10b981',
    envVariables: [
      { id: 'env-7', key: 'GEMINI_API_KEY', value: 'AIzaSyKeyForRAGPipelineSecret', isSecret: true, description: 'Gemini embedding & generation key' },
      { id: 'env-8', key: 'QDRANT_HOST', value: 'localhost:6333', isSecret: false, description: 'Vector store host' },
    ],
    scripts: [
      { id: 'scr-10', label: 'Start FastAPI', command: 'uvicorn main:app --reload --port 5000', category: 'dev', description: 'Starts Python API server' },
      { id: 'scr-11', label: 'Qdrant Docker', command: 'docker run -p 6333:6333 qdrant/qdrant', category: 'docker', description: 'Runs local Qdrant container' },
    ],
    tasks: [
      { id: 'tsk-12', title: 'Benchmark cosine vs dot product retrieval accuracy', completed: true, tag: 'Eval', priority: 'medium' },
      { id: 'tsk-13', title: 'Add reranker model with Cross-Encoder', completed: false, tag: 'Optimization', priority: 'high' },
    ],
    notes: 'Qdrant running on port 6333. API runs on port 5000.',
    createdAt: '2026-08-10T15:00:00Z',
    updatedAt: '2026-08-27T10:00:00Z',
    isStarred: false,
  },
];

export const DEFAULT_AI_PROMPTS: AIPrompt[] = [
  {
    id: 'prm-swift-architect',
    title: 'macOS SwiftUI & Liquid Glass Native Architect',
    category: 'architecture',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are an Apple Principal Engineer specializing in Swift 6, SwiftUI, AppKit, and macOS Liquid Glass design systems.
When designing macOS applications or components:
1. Use modern Swift 6 strict concurrency, @Observable macros, and structured async/await.
2. Structure views using SwiftUI Liquid Glass styling (.ultraThinMaterial, gradient stroke overlays, continuous rounded corners, vibrancy).
3. Integrate macOS native patterns (MenuBarExtra, AppKit NSWorkspace, global keyboard shortcuts, and SPM Package.swift).
4. Provide idiomatic, compile-ready Swift code with unit tests.`,
    userTemplate: `I am building a native macOS app in Swift 6 & SwiftUI.
App Name: {{app_name}}
macOS Target: macOS 14 Sonoma / macOS 15 Sequoia
UI Style: Liquid Glass Acrylic Translucency
Requirements:
{{requirements}}

Please provide the SwiftUI architecture, data flow, and complete Swift view implementations.`,
    tags: ['Swift', 'SwiftUI', 'macOS', 'Liquid Glass', 'Apple'],
    isFavorite: true,
    variables: ['app_name', 'requirements'],
  },
  {
    id: 'prm-1',
    title: 'Senior Software Architect Blueprint Planner',
    category: 'architecture',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are a Principal Software Architect with 15+ years of experience in distributed systems, modern frontend architecture, and cloud-native backends.
Analyze the user's project requirements and provide:
1. Executive Architectural Summary & Key Design Decisions
2. Data Flow & Component Hierarchy diagram (in ASCII / Mermaid)
3. Technology Tradeoffs & Recommended Libraries (with rationale)
4. Failure Modes & Edge Case mitigation strategy
5. Step-by-step implementation milestones with time estimates.`,
    userTemplate: `I am building {{project_name}}.
Tech Stack: {{tech_stack}}
Core Functional Requirements:
{{requirements}}

Please provide an actionable architecture blueprint.`,
    tags: ['Architecture', 'System Design', 'Planning'],
    isFavorite: true,
    variables: ['project_name', 'tech_stack', 'requirements'],
  },
  {
    id: 'prm-2',
    title: 'Rigorous TypeScript & React Code Reviewer',
    category: 'review',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are a strict, pragmatic Senior Code Reviewer.
Review the provided code for:
- TypeScript strictness (avoiding any, improper generics, type safety leaks)
- React 19 best practices (avoiding unnecessary useEffect, infinite re-renders, stale closures, missing memoization)
- Performance bottlenecks (bundle size, re-renders, memory leaks)
- Security vulnerabilities (XSS, prototype pollution, unsafe inputs)
- Code elegance and readability.
Provide concrete refactored code snippets with explanations.`,
    userTemplate: `Review the following code from project {{project_name}}:
\`\`\`{{language}}
{{code}}
\`\`\``,
    tags: ['Code Review', 'TypeScript', 'Security', 'React'],
    isFavorite: true,
    variables: ['project_name', 'language', 'code'],
  },
  {
    id: 'prm-3',
    title: 'Bulletproof Unit & Integration Test Suite Generator',
    category: 'testing',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are an expert QA Engineer and TDD specialist.
Given a function, component, or API route, generate comprehensive test cases covering:
1. Happy path operations
2. Boundary and edge conditions (empty lists, null, undefined, max integers, special characters)
3. Network error handling and timeouts
4. Concurrency or race conditions
Use Vitest / Jest with React Testing Library or Supertest as appropriate. Include clean mocks.`,
    userTemplate: `Generate test cases for this code:
\`\`\`{{language}}
{{code}}
\`\`\`
Testing framework: {{framework}}`,
    tags: ['Testing', 'Vitest', 'Jest', 'TDD'],
    isFavorite: false,
    variables: ['language', 'code', 'framework'],
  },
  {
    id: 'prm-4',
    title: 'Conventional Git Commit Message Crafter',
    category: 'coding',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are a Git workflow expert.
Generate clean, informative, standard Conventional Commit messages following the specification:
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]

Rules:
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- Imperative present tense ("add feature" not "added feature").
- Keep header under 72 characters.`,
    userTemplate: `Generate commit messages for this change:
Summary: {{summary}}
Diff / Changes:
\`\`\`
{{diff}}
\`\`\``,
    tags: ['Git', 'Conventional Commits', 'Workflow'],
    isFavorite: true,
    variables: ['summary', 'diff'],
  },
  {
    id: 'prm-5',
    title: 'SQL & Database Schema Designer with Migrations',
    category: 'architecture',
    modelTarget: 'Gemini 3.7 Flash',
    systemPrompt: `You are a Principal Database Administrator and data modeling expert.
Design clean, normalized 3NF database schemas with proper indices, foreign key cascades, JSONB fields where appropriate, and timestamp tracking. Provide standard SQL DDL as well as Drizzle ORM or Prisma schemas if requested.`,
    userTemplate: `Design a schema for {{domain_name}}:
Entities and Relationships:
{{description}}
Database Engine: {{engine}}`,
    tags: ['Database', 'PostgreSQL', 'SQL', 'Drizzle'],
    isFavorite: false,
    variables: ['domain_name', 'description', 'engine'],
  },
];

export const DEFAULT_PROMPTS = DEFAULT_AI_PROMPTS;

export const DEFAULT_SNIPPETS: DevSnippet[] = [
  {
    id: 'snp-swift-1',
    title: 'SwiftUI macOS Liquid Glass Material Card',
    category: 'swift',
    code: `import SwiftUI

struct LiquidGlassCard<Content: View>: View {
    @ViewBuilder let content: Content
    
    var body: some View {
        content
            .padding(20)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [.white.opacity(0.35), .white.opacity(0.08), .clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .shadow(color: .black.opacity(0.18), radius: 24, x: 0, y: 12)
    }
}`,
    command: 'swift run',
    description: 'Native SwiftUI Liquid Glass container with ultraThinMaterial blur, specular border refraction, and dynamic elevation',
    tags: ['swift', 'swiftui', 'macos', 'liquid-glass', 'ui'],
    copyCount: 178,
  },
  {
    id: 'snp-swift-2',
    title: 'Swift 6 Actor & Async/Await API Client',
    category: 'swift',
    code: `import Foundation

actor GeminiNetworkClient {
    private let session: URLSession
    private let apiKey: String
    
    init(apiKey: String, session: URLSession = .shared) {
        self.apiKey = apiKey
        self.session = session
    }
    
    func generateContent(prompt: String) async throws -> String {
        let endpoint = URL(string: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=\\(apiKey)")!
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = ["contents": [["parts": [["text": prompt]]]]]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return String(decoding: data, as: UTF8.self)
    }
}`,
    command: 'swift test',
    description: 'Thread-safe Swift 6 Actor with structured Async/Await, URLSession, and concurrency isolation',
    tags: ['swift', 'concurrency', 'async-await', 'actor', 'gemini'],
    copyCount: 145,
  },
  {
    id: 'snp-swift-3',
    title: 'macOS MenuBarExtra SwiftUI App Lifecycle',
    category: 'swift',
    code: `import SwiftUI

@main
struct DevDeckMenuBarApp: App {
    @State private var isMonitoring = true
    
    var body: some Scene {
        MenuBarExtra("DevDeck macOS", systemImage: "sparkles.rectangle.stack") {
            VStack(alignment: .leading, spacing: 12) {
                Text("DevDeck Native Companion")
                    .font(.headline)
                Divider()
                Button("Launch Liquid Glass Studio") {
                    NSWorkspace.shared.open(URL(string: "http://localhost:3000")!)
                }
                .keyboardShortcut("o", modifiers: [.command])
                
                Toggle("Active Port Watcher", isOn: $isMonitoring)
                Divider()
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .keyboardShortcut("q", modifiers: [.command])
            }
            .padding()
            .frame(width: 260)
        }
        .menuBarExtraStyle(.window)
    }
}`,
    command: 'swift build -c release',
    description: 'Native macOS Status Bar MenuBarExtra app with hotkeys, popover window, and NSWorkspace actions',
    tags: ['swift', 'macos', 'menubarextra', 'appkit', 'swiftui'],
    copyCount: 162,
  },
  {
    id: 'snp-swift-4',
    title: 'Swift Package Manager (Package.swift) Manifest',
    category: 'swift',
    code: `// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "DevDeckCore",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [
        .library(name: "DevDeckCore", targets: ["DevDeckCore"]),
        .executable(name: "devdeck-cli", targets: ["DevDeckCLI"])
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser", from: "1.3.0"),
        .package(url: "https://github.com/vapor/vapor.git", from: "4.90.0")
    ],
    targets: [
        .target(name: "DevDeckCore", dependencies: []),
        .executableTarget(name: "DevDeckCLI", dependencies: [
            "DevDeckCore",
            .product(name: "ArgumentParser", package: "swift-argument-parser")
        ]),
        .testTarget(name: "DevDeckCoreTests", dependencies: ["DevDeckCore"])
    ]
)`,
    command: 'swift package resolve',
    description: 'Modern Swift 6 Package.swift manifest supporting libraries, macOS binaries, and CLI argument parsers',
    tags: ['swift', 'spm', 'package-manager', 'cli', 'apple'],
    copyCount: 92,
  },
  {
    id: 'snp-swift-5',
    title: 'Execute macOS Terminal Shell Command in Swift',
    category: 'swift',
    code: `import Foundation

@discardableResult
func runShellCommand(_ command: String) throws -> String {
    let process = Process()
    let pipe = Pipe()
    
    process.standardOutput = pipe
    process.standardError = pipe
    process.arguments = ["-c", command]
    process.executableURL = URL(fileURLWithPath: "/bin/zsh")
    
    try process.run()
    process.waitUntilExit()
    
    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    return String(decoding: data, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
}

// Example usage:
// let output = try runShellCommand("lsof -i :3000")`,
    command: 'swift run',
    description: 'Runs zsh shell commands directly from Swift AppKit / CLI with Process and Pipe stream capture',
    tags: ['swift', 'macos', 'process', 'zsh', 'terminal'],
    copyCount: 118,
  },
  {
    id: 'snp-1',
    title: 'Open Current Directory in VS Code',
    category: 'vscode',
    code: 'code .',
    command: 'code .',
    description: 'Launches VS Code in the current terminal directory',
    tags: ['vscode', 'cli', 'starter'],
    copyCount: 142,
  },
  {
    id: 'snp-2',
    title: 'Kill Process Running on Specific Port',
    category: 'port',
    code: 'lsof -ti :3000 | xargs kill -9',
    command: 'lsof -ti :3000 | xargs kill -9',
    description: 'Instantly frees up port 3000 occupied by a stuck dev server process',
    tags: ['port', 'kill', 'terminal', 'fix'],
    copyCount: 98,
  },
  {
    id: 'snp-3',
    title: 'Git Undo Last Commit (Keep Changes in Working Tree)',
    category: 'git',
    code: 'git reset --soft HEAD~1',
    command: 'git reset --soft HEAD~1',
    description: 'Uncommits the latest commit but keeps all modified files staged/unstaged',
    tags: ['git', 'undo', 'commit'],
    copyCount: 67,
  },
  {
    id: 'snp-4',
    title: 'Docker Clean All Unused Containers & Images',
    category: 'docker',
    code: 'docker system prune -af --volumes',
    command: 'docker system prune -af --volumes',
    description: 'Reclaims disk space by purging stopped containers, orphan networks, and dangling images',
    tags: ['docker', 'clean', 'storage'],
    copyCount: 45,
  },
  {
    id: 'snp-5',
    title: 'Clone GitHub Repo via GitHub CLI',
    category: 'git',
    code: 'gh repo clone developer/my-project',
    command: 'gh repo clone developer/my-project',
    description: 'Fast clone authenticated with your GitHub CLI session',
    tags: ['github', 'gh', 'clone'],
    copyCount: 38,
  },
  {
    id: 'snp-6',
    title: 'NPM Force Clean Cache & Reinstall Node Modules',
    category: 'npm',
    code: 'rm -rf node_modules package-lock.json && npm cache clean --force && npm install',
    command: 'rm -rf node_modules package-lock.json && npm cache clean --force && npm install',
    description: 'The universal fix for stubborn npm dependency resolution bugs and corrupted caches',
    tags: ['npm', 'fix', 'node_modules'],
    copyCount: 110,
  },
  {
    id: 'snp-7',
    title: 'Gemini 3.7 Flash Quick Curl Test',
    category: 'ai',
    code: 'curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=$GEMINI_API_KEY" -H "Content-Type: application/json" -d \'{"contents":[{"parts":[{"text":"Explain quantum computing in 20 words"}]}]}\'',
    command: 'curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=$GEMINI_API_KEY" -H "Content-Type: application/json" -d \'{"contents":[{"parts":[{"text":"Explain quantum computing in 20 words"}]}]}\'',
    description: 'Validates your GEMINI_API_KEY and generates a test response from the command line',
    tags: ['gemini', 'curl', 'ai', 'api'],
    copyCount: 52,
  },
  {
    id: 'snp-8',
    title: 'Git Pretty Interactive Log Graph',
    category: 'git',
    code: 'git log --graph --oneline --decorate --all -n 15',
    command: 'git log --graph --oneline --decorate --all -n 15',
    description: 'Visual ASCII graph of the recent 15 commits across all branches',
    tags: ['git', 'log', 'history'],
    copyCount: 84,
  },
];

export const DEFAULT_BOOKMARKS: DevBookmark[] = [
  { id: 'res-1', title: 'Google AI Studio', url: 'https://aistudio.google.com', category: 'ai', description: 'Test Gemini 3.7 Flash, live prompts, structured outputs and grab API keys', iconName: 'Sparkles', isPinned: true },
  { id: 'res-2', title: 'GitHub Dashboard', url: 'https://github.com', category: 'git', description: 'Your repositories, pull requests, notifications, and code discussions', iconName: 'Github', isPinned: true },
  { id: 'res-3', title: 'VS Code Web / Dev', url: 'https://vscode.dev', category: 'tools', description: 'Instant browser-based Visual Studio Code IDE for quick file reviews', iconName: 'Code', isPinned: true },
  { id: 'res-4', title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', category: 'docs', description: 'Utility-first CSS framework documentation and class search', iconName: 'Layers', isPinned: true },
  { id: 'res-5', title: 'Lucide Icons Directory', url: 'https://lucide.dev/icons', category: 'design', description: 'Comprehensive open-source vector icon set search & React snippets', iconName: 'Palette', isPinned: false },
  { id: 'res-6', title: 'Hugging Face Hub', url: 'https://huggingface.co', category: 'ai', description: 'Open-source machine learning models, datasets, spaces, and leaderboards', iconName: 'Bot', isPinned: false },
  { id: 'res-7', title: 'Google Cloud Console', url: 'https://console.cloud.google.com', category: 'cloud', description: 'Cloud Run, Cloud SQL, Secret Manager, and project credentials', iconName: 'Cloud', isPinned: false },
  { id: 'res-8', title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', category: 'cloud', description: 'Edge deployments, analytics, domains, and serverless logs', iconName: 'Globe', isPinned: false },
];

export const DEFAULT_RESOURCES = DEFAULT_BOOKMARKS;

export const DEFAULT_PORTS: PortEntry[] = [
  { id: 'prt-1', port: 3000, projectId: 'proj-1', projectName: 'NeuralPulse AI Copilot', serviceName: 'Express + Vite Fullstack', status: 'running', protocol: 'http', notes: 'Main dev port' },
  { id: 'prt-2', port: 5000, projectId: 'proj-5', projectName: 'FastRAG Semantic Engine', serviceName: 'FastAPI Python Server', status: 'idle', protocol: 'http', notes: 'RAG API' },
  { id: 'prt-3', port: 5173, projectName: 'Vite Frontend Template', serviceName: 'Vite SPA Dev Server', status: 'idle', protocol: 'http' },
  { id: 'prt-4', port: 5432, projectId: 'proj-2', projectName: 'OmniVault Cloud Sync', serviceName: 'PostgreSQL Database', status: 'running', protocol: 'tcp', notes: 'Local Postgres container' },
  { id: 'prt-5', port: 6006, projectId: 'proj-3', projectName: 'Aether Design System', serviceName: 'Storybook Docs Server', status: 'idle', protocol: 'http' },
  { id: 'prt-6', port: 6333, projectId: 'proj-5', projectName: 'FastRAG Semantic Engine', serviceName: 'Qdrant Vector DB', status: 'idle', protocol: 'http' },
  { id: 'prt-7', port: 8000, projectId: 'proj-1', projectName: 'NeuralPulse AI Copilot', serviceName: 'ChromaDB Local Vector Engine', status: 'running', protocol: 'http' },
  { id: 'prt-8', port: 8080, projectId: 'proj-2', projectName: 'OmniVault Cloud Sync', serviceName: 'Go gRPC Core Service', status: 'idle', protocol: 'http' },
];
