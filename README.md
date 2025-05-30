<div align="center" id="top"> 
  <img src="images/ai.png" alt="RAG AI-Agent" style="width: 150px; height: 150px" />
  &#xa0;
</div>
<h1 align="center">RAG AI-Agent</h1>
<div align="center" id="top" class="flex">
  <img src="images/main.jpg" alt="RAG AI-Agent" style="width: 400px; max-width: 400px; margin-bottom: 20px;" />
  <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
    <img src="images/search.jpg" alt="RAG AI-Agent" style="width: 350px; max-width: 350px;" />
    <img src="images/about.jpg" alt="RAG AI-Agent" style="width: 350px; max-width: 350px;" />
  </div>
  &#xa0;
</div>
<!-- demo -->
<div align="center">
  <img src="images/demo.gif" alt="RAG AI-Agent" style="width: 350px; max-width: 350px; margin-top: 20px;" />
</div>


<p align="center">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/romanyn36/RAG-AI-Agent?color=56BEB8">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/romanyn36/RAG-AI-Agent?color=56BEB8">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/romanyn36/RAG-AI-Agent?color=56BEB8">
  <img alt="License" src="https://img.shields.io/github/license/romanyn36/RAG-AI-Agent?color=56BEB8">
</p>

<div align="center">
    <img src="https://img.shields.io/badge/LangChain-000000?style=for-the-badge&logo=chainlink&logoColor=white" height="28" alt="LangChain" />
    <img src="https://img.shields.io/badge/Chroma-FF6C37?style=for-the-badge&logo=chroma&logoColor=white" height="28" alt="ChromaDB" />
    <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" height="28" alt="OpenAI" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" height="28" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" height="28" alt="Python" />
    <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" height="28" alt="SQLAlchemy" />
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="28" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" height="28" alt="Vite" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" height="28" alt="SQLite" />
   <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" height="28" alt="JavaScript" />
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" height="28" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" height="28" alt="CSS3" />

  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" height="28" alt="VS Code" />
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" height="28" alt="Git" />
    <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" height="28" alt="Postman" />
    
 

</div>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#architecture">Architecture</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="#heart-contact-me">Contact</a>
</p>

<br>

## :dart: About

## :dart: About

**RAG AI-Agent** is an intelligent question-answering system built on Retrieval-Augmented Generation (RAG) technology, with LangChain and vector databases at its core. The system enables users to interact conversationally with their documents by uploading files (PDFs, TXTs, etc.), which are semantically parsed, embedded, and indexed for natural language queries. When a user asks a question, the system dynamically retrieves the most relevant information from the vector database and leverages advanced language models to generate accurate, contextual responses.

A key feature of this project is its integration with **LangChain's ZERO_SHOT_REACT_DESCRIPTION agent type**, which empowers the Agent mode. This agent can reason step-by-step, use external tools (like calculators, web search, and date/time), and transparently show its thought process—making the system highly extensible and explainable. The vector database (ChromaDB) ensures efficient semantic search and retrieval, forming the backbone of the RAG pipeline.

The project is full-stack: it combines a FastAPI backend (for API, document processing, vector storage, and agent orchestration) with a modern React frontend (for chat UI, file upload, and conversation management), delivering a seamless and interactive user experience.

---

## :sparkles: Features

### **Core Capabilities:**
- **Document Processing:** Upload and process PDF, TXT, and DOCX files
- **Semantic Search:** Find relevant information within your documents using natural language queries
- **RAG-based Responses:** Generate contextual answers by combining retrieved information with AI capabilities
- **Chat Interface:** Intuitive conversation-based UI with chat history management(rename, delete, and save conversations)

### **Agent Mode:**
- **Step-by-step Reasoning:** View the agent's thought process and steps taken to answer complex questions
- **Tool Integration:** Access to calculator, current time, and web search tools
- **Transparent Decision Making:** See exactly how the agent formulates responses

### **File Management:**
- **Document Upload:** Upload documents directly in chat conversations
- **Vector Storage:** Efficient retrieval using semantic vector embeddings
- **Context Preservation:** Documents are linked to specific conversations

### **Chat Features:**
- **Chat History:** Save and load conversation history
- **Chat Management:** Create, rename and delete conversations
- **User-friendly Interface:** Clean, responsive design with intuitive controls
- **Dark Mode:** Toggle between light and dark themes for better readability

---

## :rocket: Technologies

The following tools and frameworks were used in this project:

- **Backend:**
  - [FastAPI](https://fastapi.tiangolo.com/) - Modern, high-performance web framework for building APIs
  - [LangChain](https://langchain.com/) - Framework for developing applications powered by language models
  - [ChromaDB](https://www.trychroma.com/) - Vector database for storing and retrieving embeddings
  - [SQLite](https://www.sqlite.org/) - Database for storing chat and message information
  - [OpenAI](https://openai.com/) - Language models and embedding generation
  - [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and Object-Relational Mapping
  

- **Frontend:**
  - [React](https://reactjs.org/) - A JavaScript library for building user interfaces
  - [React Bootstrap](https://react-bootstrap.github.io/) - Bootstrap components built with React
  - [React Router](https://reactrouter.com/) - Routing for React applications
  - [Axios](https://axios-http.com/) - Promise-based HTTP client
  - [React Icons](https://react-icons.github.io/react-icons/) - Popular icons for React projects
  - [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications for React
  - [Vite](https://vitejs.dev/) - Next generation frontend tooling

- **Document Processing:**
  - [PyPDF](https://pypdf2.readthedocs.io/) - PDF processing
  - [Unstructured](https://unstructured.io/) - Document parsing (markdown, etc.)
  - [LangChain Document Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/) - Various document loading utilities

## Architecture

The application follows a client-server architecture with the following components:

1. **Frontend (React):**
   - Chat interface with conversation management
   - File upload functionality
   - Agent mode toggle
   - Reasoning step visualization

2. **Backend (FastAPI):**
   - API endpoints for chat and message management
   - Document processing pipeline
   - Vector database integration
   - Agent execution logic

3. **Vector Database (ChromaDB):**
   - Stores document embeddings
   - Enables semantic search for relevant content

4. **Agent System:**
   - Retrieves relevant context from the vector database
   - Uses tools like calculator, web search, and date-time
   - Generates responses with reasoning steps

5. **Data Storage:**
   - SQLite database for storing chat history and messages
   - File system for document storage

---

## Pipeline 
- The pipeline for processing user queries is as follows:
- first the user uploads a document, then the system processes the document and splits it into chunks. The chunks are then embedded and stored in the vector database. When the user asks a question, the system retrieves relevant chunks from the vector database based on the query. The retrieved chunks are then used to generate a response using the OpenAI language model. The response is displayed to the user in the chat interface.
- 
1. **User Input:** User submits a question or query through the chat interface.
2. **Document Retrieval:** The system retrieves relevant documents from the vector database based on the query.
3. **Context Generation:** The retrieved documents are processed to generate context for the query.
4. **Agent Execution:** The agent uses the context to generate a response, optionally using reasoning steps and tools.
5. **Response Generation:** The agent generates a response based on the context and reasoning steps.
6. **Response Display:** The response is displayed in the chat interface, along with any reasoning steps taken by the agent.
7. **User Interaction:** The user can continue the conversation, ask follow-up questions, or upload new documents.
---

## :white_check_mark: Requirements

Before starting, ensure you have the following installed:

- Python 3.11
- Node.js 16+ and npm
- OpenAI API key
- Git

---

## :checkered_flag: Starting

```bash
# Clone this project
$ git clone https://github.com/romanyn36/RAG-AI-Agent.git

# Navigate to the project directory
$ cd RAG-AI-Agent

# Create a virtual environment
$ python -m venv venv

# Activate the virtual environment
$ source venv/bin/activate  # For Linux/Mac
$ venv\Scripts\activate     # For Windows

# Install backend dependencies
$ pip install -r requirements.txt

# Create a .env file with your OpenAI API key
$ echo "OPENAI_API_KEY=your_api_key_here" > .env

# Start the backend server
$ uvicorn app:app --reload

# In a separate terminal, navigate to the frontend directory
$ cd agent-frontend

# Install frontend dependencies
$ npm install
# set the environment variable for the backend URL
$ echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Start the development server
$ npm run dev

# The frontend will be available at http://localhost:5173
# The backend API will be available at http://localhost:8000
```

## Configuration

You can adjust the following settings:

1. In `vector_database.py`:
   - Change `chunk_size` and `chunk_overlap` for document splitting
   - Adjust `similarity_threshold` for relevance filtering

2. In `agent.py`:
   - Modify `PROMPT_TEMPLATE` to change how responses are generated
   - Add or remove tools from the agent

# ## :construction: What’s Next?
RAG AI-Agent is actively under development, and I’m working on exciting new features to make it even more powerful:  

Login & Authentication: Secure user access with robust authentication.  
User Registration: Onboard new users seamlessly with a registration system.  
Personalized Chat History: Store and manage conversation history for each user.  
Expanded File Support: Add compatibility for more file types to enhance document processing capabilities.
## :memo: License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

## :heart: Contact Me

- Made by Romani – an AI Engineer and Backend Developer. Feel free to reach out for collaborations, questions, or new projects!
You can contact me via email:
  <a href="mailto:romani.nasrat@gmail.com">
    romani.nasrat@gmail.com
  </a>

- You can also find me on:
<div align="center">
  <a href="https://www.linkedin.com/in/romaninasrat/" target="_blank">
    <img src="https://raw.githubusercontent.com/maurodesouza/profile-readme-generator/master/src/assets/icons/social/linkedin/default.svg" width="52" height="40" alt="linkedin logo"  />
  </a>
  <a href="https://x.com/RomaniNasrat" target="_blank">
    <img src="https://raw.githubusercontent.com/maurodesouza/profile-readme-generator/master/src/assets/icons/social/twitter/default.svg" width="52" height="40" alt="twitter logo"  />
  </a>
  <a href="romani.nasrat@gmail.com" target="_blank">
    <img src="https://raw.githubusercontent.com/maurodesouza/profile-readme-generator/master/src/assets/icons/social/gmail/default.svg" width="52" height="40" alt="gmail logo"  />
  </a>
  <a href="https://t.me/romanyn36" target="_blank">
    <img src="https://raw.githubusercontent.com/maurodesouza/profile-readme-generator/master/src/assets/icons/social/telegram/default.svg" width="52" height="40" alt="telegram logo"  />
  </a>
  <a href="https://github.com/romanyn36" target="blank"><img  src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg" alt="romanyn36" height="40" width="52" /></a>
   <a href="https://kaggle.com/romanyn36" target="blank"><img src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/kaggle.svg" alt="romanyn36" height="40" width="52" /></a>


</div>

<a href="#top">Back to top</a>


