# Personal Chatbot

A simple terminal chatbot built with Python. It can use either OpenRouter or OpenAI through the OpenAI Python SDK.

The project also includes a small SQLite memory database, but the current chatbot conversation in `main.py` is stored only while the program is running. The SQLite helper files are ready for saving and viewing memory data.

## Folder Structure

```text
personal-chatbot/
├── .env                 # API keys and model settings
├── database.py          # Creates the SQLite memories table
├── main.py              # Main chatbot program
├── memory.py            # Helper functions to save/read memories
├── memory.db            # SQLite database file
├── requirements.txt     # Python dependencies
├── view_memory.py       # Shows saved SQLite memories
├── venv/                # Local Python virtual environment
└── README.md            # Project documentation
```

## Requirements

- Python
- An OpenRouter API key or OpenAI API key

Python packages:

```text
openai
python-dotenv
```

## Environment Setup

Create a `.env` file in the project folder.

For OpenRouter:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL_NAME=openai/gpt-4o-mini
```

For OpenAI:

```env
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini
```

Only one API key is required. If both are present, the app uses OpenRouter first.

## Install Dependencies

From PowerShell:

```powershell
cd D:\personal-chatbot
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run the Chatbot

```powershell
cd D:\personal-chatbot
.\venv\Scripts\python.exe main.py
```

Type your message after:

```text
You:
```

To stop the chatbot, type:

```text
exit
```

## SQLite Memory

The SQLite database file is:

```text
memory.db
```

The memory table is created by `database.py`:

```text
memories
```

Columns:

```text
id
memory_key
memory_value
created_at
```

Create the table:

```powershell
cd D:\personal-chatbot
.\venv\Scripts\python.exe database.py
```

View saved memories:

```powershell
cd D:\personal-chatbot
.\venv\Scripts\python.exe view_memory.py
```

## Current Workflow

```text
User types a message
        ↓
Save user message to SQLite
        ↓
main.py sends the message to the AI model
        ↓
AI returns a response
        ↓
Save AI response to SQLite
        ↓
main.py prints the response in the terminal
```

The active chat context is still kept in memory while the program is running. The SQLite database stores the messages so you can inspect them later with `view_memory.py`.

## Memory Helpers

```python
from memory import save_memory, get_memories, get_memory

save_memory("name", "Mg Mg")
print(get_memories())
print(get_memory("name"))
```
