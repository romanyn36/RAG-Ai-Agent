import os
import openai 
import shutil
import argparse
import datetime
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI,OpenAI
from langchain.prompts import ChatPromptTemplate
from vector_database import query_data,get_vector_db
from langchain.agents import initialize_agent, AgentType
from langchain.agents import Tool
from langchain.agents import AgentExecutor
from langchain_experimental.tools.python.tool import PythonREPLTool
from langchain_community.tools.ddg_search.tool import DuckDuckGoSearchRun



PROMPT_TEMPLATE = """
Answer the question based only on the following context:
{context}

---------------
Answer the question based on the above context: {question}
"""

def agent_executor(query_text:str,agent=False):
    rlevant_docs = query_data(query_text)
    # if rlevant_docs:
    #     return "No relevant documents found."
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in rlevant_docs])
    prompt_template=ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt=prompt_template.format(context=context_text,question=query_text)
    tools = []
    
    if agent:
        def get_current_time(*args):
            return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        date_tool = Tool(
            name="Get Current Time",
            func=get_current_time,
            description="Get the current date and time."
        )
        # calculator_tool 
        calculator_tool = PythonREPLTool(
            name="Calculator",
            description="A calculator that can perform basic arithmetic operations."
        )
        # search_tool 
        search_tool = DuckDuckGoSearchRun(
            name="DuckDuckGo Search",
            description="A search tool that can search the web "
        )
        tools.extend([date_tool, calculator_tool, search_tool])
    llm=ChatOpenAI()
    if agent:
        agent_executor = initialize_agent(
            tools=tools,
            llm=llm,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            handle_parsing_errors=True,
        )
    
        response = agent_executor.run(prompt)
    else:
        response = llm.invoke(prompt).content
    sources = [doc.metadata.get("source", None) for doc, _score in rlevant_docs]
    final_response = {
        "response": response,
        "sources": sources
    }
    return final_response
    

    

