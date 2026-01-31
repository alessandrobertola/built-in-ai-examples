# Web API IA - Chrome Web AI APIs Overview

## 🎯 Project Intent

This project is a **collection of exercises and demonstrations** of the new **Chrome Web AI APIs** (Built-in AI APIs). The goal is to provide a practical and comprehensive overview of how to use AI APIs integrated directly into the Chrome browser, without the need for external servers or API keys.

The APIs use **Gemini Nano**, a lightweight language model that runs locally in the browser, ensuring:
- ✅ **Privacy**: data never leaves the device
- ✅ **Speed**: local processing without network latency
- ✅ **Cost**: no cost for API calls
- ✅ **Offline**: works even without internet connection (after initial model download)

## 📋 Requirements

- **Node.js 18+** (for running the dev server and build)
- **Chrome 131+** or **Edge 131+** (with Built-in AI support)
- Gemini Nano model must be downloaded and installed in the browser
- For more information: [Chrome AI APIs Documentation](https://developer.chrome.com/docs/ai/built-in-apis)

## 🌐 API availability & origin trials

Some Built-in AI APIs are **open** (generally available), while others are still in **origin trial** (experimental) and only work on **localhost with specific Chrome flags enabled**.

### What is an origin trial?

An **origin trial** is a way for Chrome to ship new or experimental features to developers before a full release. APIs in origin trial:

- Are **experimental** and may change before becoming stable
- Allow Chrome to gather feedback and iterate on the API design
- Are typically **restricted to localhost** (or enrolled origins) so they are not exposed to all websites yet
- Require **Chrome flags** to be enabled when testing locally, unless you register your origin in the [Chrome Origin Trials](https://developer.chrome.com/docs/web-platform/origin-trials/) program

Once an API graduates from origin trial, it becomes **open** and works without flags on supported browsers.

### API status in this project

- **Open APIs (no flags required)**  
  - LanguageDetector  
  - Translator  
  - Summarizer  

- **Origin trial APIs (localhost + flags required)**  
  - Prompt (LanguageModel / Prompt API)  
  - Writer  
  - Rewriter  
  - Proofreader  

### Enabling origin trial APIs locally

To run the origin trial APIs on `http://localhost` in Chrome, enable these flags and then restart Chrome:

```text
chrome://flags/#optimization-guide-on-device-model
chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
chrome://flags/#writer-api-for-gemini-nano
chrome://flags/#proofreader-api-for-gemini-nano
```

**Steps:** set each flag to **Enabled** (or **Enabled Multilingual** where available), then click **Relaunch** or restart Chrome. The APIs will then be available when you open the app from `http://localhost` (e.g. `http://localhost:5173` with `npm run dev`).

For more details: [Chrome Origin Trials](https://developer.chrome.com/docs/web-platform/origin-trials/).

Each exercise page shows an **API info header** (documentation link + status badge + origin-trial instructions) generated from `src/assets/api-info.json` and `src/utils/api-info.ts`.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server (Vite dev server with HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

**Tech stack**: Vite 7, TypeScript 5.9, [Chrome Built-in AI types](https://www.npmjs.com/package/@types/dom-chromium-ai).

## 📚 Web APIs Overview

### 1. **LanguageDetector API** 🔍
**File**: `src/features/language-detector.ts` | `pages/language-detector.html`

Automatically detects the language of input text.

**Features**:
- Automatic language detection
- Returns detected language and confidence score
- Useful for multilingual applications

**Usage Example**:
```typescript
const detector = await LanguageDetector.create();
const results = await detector.detect("Hello, how are you?");
// results[0].detectedLanguage = "en"
// results[0].confidence = 0.95
```

---

### 2. **Translator API** 🌐
**File**: `src/features/translator.ts` | `pages/translator.html`

Translates text between different languages in real-time.

**Features**:
- Streaming translation (real-time results)
- Support for automatic source language detection
- Support for multiple language pairs
- Integration with LanguageDetector for automatic detection

**Usage Example**:
```typescript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'it'
});
const stream = translator.translateStreaming("Hello world");
for await (const chunk of stream) {
  // chunk contains parts of the translation
}
```

---

### 3. **Summarizer API** 📝
**File**: `src/features/summarizer.ts` | `pages/summarizer.html`

Summarizes long content into more concise versions.

**Features**:
- **Summary types**: `abstractive` (creative) or `extractive` (extracted)
- **Length**: `short`, `medium`, `long`
- **Format**: `plain-text`, `markdown`, `bullets`
- **Output language**: configurable

**Usage Example**:
```typescript
const summarizer = await Summarizer.create({
  type: 'abstractive',
  length: 'short',
  format: 'markdown',
  outputLanguage: 'en'
});
const stream = summarizer.summarizeStreaming(longText);
```

---

### 4. **Writer API** ✍️
**File**: `src/features/writer.ts` | `pages/writer.html`

Creates new content based on a writing prompt.

**Features**:
- **Tone**: `neutral`, `formal`, `casual`, `humorous`, etc.
- **Length**: `short`, `medium`, `long`
- **Format**: `plain-text`, `markdown`, `bullets`
- **Shared context**: support for additional context
- **Output language**: configurable

**Usage Example**:
```typescript
const writer = await Writer.create({
  tone: 'formal',
  length: 'medium',
  format: 'markdown',
  outputLanguage: 'en',
  sharedContext: 'Optional additional context'
});
const stream = writer.writeStreaming("Write an article about...");
```

---

### 5. **Rewriter API** 🔄
**File**: `src/features/rewriter.ts` | `pages/rewriter.html`

Reviews and restructures existing text to improve it.

**Features**:
- **Tone**: configurable (like Writer)
- **Length**: configurable
- **Format**: configurable
- **Context**: support for additional context to improve rewriting
- **Output language**: configurable

**Usage Example**:
```typescript
const rewriter = await Rewriter.create({
  tone: 'professional',
  length: 'medium',
  format: 'markdown',
  outputLanguage: 'en',
  sharedContext: 'Context for rewriting'
});
const stream = rewriter.rewriteStreaming(existingText, {
  context: 'Additional context for this rewrite'
});
```

---

### 6. **LanguageModel API (Prompt)** 💬
**File**: `src/features/prompt.ts` | `pages/prompt.html`

Sends natural language requests directly to Gemini Nano.

**Features**:
- Generic interface for custom prompts
- Support for initial prompts (system prompts)
- Response streaming
- Maximum flexibility for custom use cases

**Usage Example**:
```typescript
const model = await LanguageModel.create({
  initialPrompts: [
    {
      role: 'user',
      content: 'You are an expert assistant...'
    }
  ]
});
const stream = model.promptStreaming("Question or request");
```

---

### 7. **Proofreader API** ✅
**File**: `src/features/proofreader.ts` | `pages/proofreader.html`

Provides interactive corrections for text, identifying errors and suggestions.

**Features**:
- Grammatical error detection
- Correction suggestions
- Structured JSON results
- Useful for text editors and writing applications

**Usage Example**:
```typescript
const proofreader = await Proofreader.create();
const result = await proofreader.proofread(text);
// result contains errors, suggestions, and corrections
```

---

## 🔧 Common Patterns

### Availability Check
All APIs follow a common pattern to check availability:

```typescript
// 1. Check if API exists in browser
if (!('Translator' in self)) {
  console.log('API not available');
  return;
}

// 2. Check availability with specific parameters
const availability = await Translator.availability({
  sourceLanguage: 'en',
  targetLanguage: 'it'
});

if (availability === 'unavailable') {
  console.log('API not available for these parameters');
  return;
}

// 3. Create instance
const translator = await Translator.create({...});
```

### Download Monitoring
During creation, you can monitor the model download progress:

```typescript
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'it',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      const progress = ((e.loaded / e.total) * 100).toFixed(0);
      console.log(`Download: ${progress}%`);
    });
  }
});
```

### Streaming
Most APIs support streaming for real-time results:

```typescript
const stream = translator.translateStreaming(text);
let result = '';
for await (const chunk of stream) {
  result += chunk;
  // Update UI in real-time
}
```

### Cleanup
It's important to destroy instances when they're no longer needed:

```typescript
translator.destroy();
translator = null;
```

## 📖 Useful Resources

- [Chrome AI APIs Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [Web AI Demos (GitHub)](https://github.com/GoogleChromeLabs/web-ai-demos)
- [Getting Started Guide](https://developer.chrome.com/docs/ai/get-started#model_download)

## 🏗️ Project Structure

```
web-api-ia/
├── pages/              # HTML pages for each API
│   ├── translator.html
│   ├── language-detector.html
│   ├── summarizer.html
│   ├── writer.html
│   ├── rewriter.html
│   ├── prompt.html
│   └── proofreader.html
├── public/             # Static assets (e.g. favicon)
├── src/
│   ├── features/       # TypeScript implementation of each API
│   │   ├── translator.ts
│   │   ├── language-detector.ts
│   │   ├── summarizer.ts
│   │   ├── writer.ts
│   │   ├── rewriter.ts
│   │   ├── prompt.ts
│   │   └── proofreader.ts
│   ├── assets/         # Static JSON configuration
│   │   ├── api-info.json
│   │   └── languages.json
│   ├── utils/          # Utilities and helpers
│   │   ├── api-info.ts
│   │   ├── languages.ts
│   │   └── logger.ts
│   ├── style.css
│   └── main.ts
└── index.html          # Main menu
```

## 🎓 Use Cases

These APIs are ideal for:

- **Multilingual applications**: automatic translation and language detection
- **Text editors**: grammatical correction and rewriting
- **Content management**: content generation and summarization
- **Virtual assistants**: natural language interactions
- **Offline applications**: AI functionality without internet connection

## ⚠️ Important Notes

1. **Availability**: APIs are only available on Chrome/Edge 131+ with Gemini Nano installed
2. **Initial download**: The model is downloaded the first time (may take time)
3. **Resources**: The model uses device memory and resources
4. **Limitations**: APIs have limitations compared to more powerful cloud models, but offer privacy and speed

## 📝 License

This project is an educational example to demonstrate the usage of Chrome Web AI APIs.
