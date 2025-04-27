import datetime
from langchain.agents import Tool
from langchain.agents import AgentExecutor
from langchain_openai import ChatOpenAI,OpenAI
from langchain.prompts import ChatPromptTemplate
from vector_database import query_data,get_vector_db
from langchain.agents import initialize_agent, AgentType
from langchain_experimental.tools.python.tool import PythonREPLTool
from langchain_community.tools.ddg_search.tool import DuckDuckGoSearchRun



PROMPT_TEMPLATE = """
Answer the question based on the following context:
{context}

---------------
the question : {question}
"""
def parse_reasoning_steps(result):
        response = result["output"]
        reasoning_steps = []
        if "intermediate_steps" in result:
            for step in result["intermediate_steps"]:
                action = step[0]  # The action the agent decided to take
                observation = step[1]  # The result of the action
                
                # Handle empty observations or ensure they're strings
                observation_str = str(observation) if observation else "No result returned"
                
                reasoning_steps.append({
                    "action": {
                        "tool": action.tool,
                        "tool_input": action.tool_input,
                        "log": action.log,  # Add the agent's thought process
                    },
                    "observation": observation_str
                })
        return response, reasoning_steps
    
    

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
            return_intermediate_steps=True,
        )
    
        # response = agent_executor.run(prompt)
        result = agent_executor({"input": prompt})
        response, reasoning_steps = parse_reasoning_steps(result)
    else:
        response = llm.invoke(prompt).content
    sources = [doc.metadata.get("source", None) for doc, _score in rlevant_docs]
    final_response = {
        "response": response,
        "sources": sources,
        "reasoning_steps": reasoning_steps if agent else None
    }
    return final_response
    

    

