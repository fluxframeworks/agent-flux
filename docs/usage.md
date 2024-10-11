# Usage Guide
This guide explores more advanced usage scenarios for Agent Flux, building upon the basics covered in the Quick Start.

![](res/memory-man.png)

## Tool Usage
Agent Flux's power comes from its ability to use tools. Here's how to leverage them effectively:

* **Default Tools:** Agent Flux typically includes default tools like knowledge, webpage content, code execution, and communication.  Understand the capabilities of these tools and how to invoke them.
* **Creating Custom Tools:**  Extend Agent Flux's functionality by creating your own custom tools. Refer to [Adding Tools](architecture.md#adding_tools) for detailed instructions.
* **New in 0.7 ❗ | Instruments:**  Instruments are a new type of tool that allow you to create custom functions that can be called by Agent Flux.  Refer to [Adding Instruments](architecture.md#adding_instruments) for further details.
* **Tool Arguments:**  Provide the necessary arguments to the tools.  Agent Flux expects tools to be invoked with a JSON-formatted string containing the tool name and arguments.  Refer to the Quick Start and example prompts for how to format tool calls.

## Example: Web Search and Code Execution
Let's say you want Agent Flux to find the current price of Bitcoin and then convert it to Euros. Here's a possible prompt:

> Please be a professional financial analyst. Find last month Bitcoin/USD price trend and make a chart in your environment. The chart must have highlighted key points corresponding with dates of major news about cryptocurrency. Use the 'knowledge_tool' to find the price and the 'code_execution_tool' to perform the rest of the job.

Agent Flux might then:

1. Use the `knowledge_tool` to query a reliable source for the Bitcoin price.
2. Extract the price from the search results.
3. Use the `code_execution_tool` to execute a Python script that performs the conversion using the provided exchange rate.
4. Return the final price in Euros.

This example demonstrates how to combine multiple tools to achieve a simple task. By mastering prompt engineering and tool usage, you can unlock the full potential of Agent Flux to solve complex problems.

## Memory Management
* **Persistence:** Agent Flux's memory persists across sessions, allowing agents to learn from past interactions.
* **Memory Retrieval:** Agents can access their memory to retrieve relevant information and experiences.  The `memory_tool` is used for this purpose.
* **Knowledge Base:** You can augment the agent's knowledge by providing external knowledge files. (Link to documentation on knowledge base management).

## Multi-Agent Cooperation
One of Agent Flux's unique features is multi-agent cooperation.

* **Creating Sub-Agents:** Agents can create sub-agents to delegate sub-tasks.  This helps manage complexity and distribute workload.
* **Communication:** Agents can communicate with each other, sharing information and coordinating actions. The system prompt and message history play a key role in guiding this communication.
* **Hierarchy:** Agent Flux uses a [hierarchical structure](architecture.md#agent-hierarchy-and-communication), with superior agents delegating tasks to subordinates.  This allows for structured problem-solving and efficient resource allocation.

![](res/physics.png)
![](res/physics-2.png)

## Prompt Engineering
Effective prompt engineering is crucial for getting the most out of Agent Flux. Here are some tips and techniques:

* **Be Clear and Specific:** Clearly state your desired outcome.  The more specific you are, the better Agent Flux can understand and fulfill your request.  Avoid vague or ambiguous language.
* **Provide Context:** If necessary, provide background information or context to help the agent understand the task better. This might include relevant details, constraints, or desired format for the response.
* **Break Down Complex Tasks:**  For complex tasks, break them down into smaller, more manageable sub-tasks.  This makes it easier for the agent to reason through the problem and generate a solution.
* **Iterative Refinement:** Don't expect perfect results on the first try.  Experiment with different prompts, refine your instructions based on the agent's responses, and iterate until you achieve the desired outcome.
* **System-Level Instructions:** A custom prompts directory changes the agent's overall behavior.  You can copy the default files and modify them to give the agent specific instructions, biases, or constraints. The same goes for the tool files, that you can modify to give the agent specific instructions, biases, or constraints for each tool. See (architecture.md#prompts) for more information.

## Agent Behavior
* **System Prompt:**  The core of Agent Flux's behavior is defined in the system prompt.  Experiment with different system prompts to customize the agent's personality, biases, and reasoning approach.
* **Prompts Directory:** The `prompts` directory contains various prompt templates used by the framework. You can modify these templates to customize the agent's communication style, instructions, and responses. See [Prompt Customization](architecture.md#custom-prompts) for more information.
* **Creating New Tools and Instructions:** Extend Agent Flux's capabilities with custom tools and instructions. This allows you to add new features, modify existing behavior, and integrate with other systems.

## Using Agent Flux on your mobile device
To access the Agent Flux Web UI from other devices on your network and run it on all hosts, such as your smartphones or tablets:

1.  In `run_ui.py`, add `host="0.0.0.0"` (or your private IP) to the `app.run()` command before the `port` argument (end of `run_ui.py`). The edited line of code should look like this:
```python
app.run(request_handler=NoRequestLoggingWSGIRequestHandler, host="0.0.0.0", port=port)
```
2. Access the Web UI from other devices using `http://$YOUR_PRIVATE_IP:50001`.
> On local networks, usually 192.168.x.x or 10.0.x.x.

- Tips for running on cloud servers or VPNs:
    - If you're using a VPN, you may need to use your public IP address instead of your private IP. You can find your public IP address by visiting a website like [https://www.whatismyip.com/](https://www.whatismyip.com/).

    - If you're using a cloud server, you can use the server's public IP address instead of your private IP. You may need to configure your server's firewall to allow incoming traffic on port 50001.

    - If you're using a remote server, you may need to use a service like [ngrok](https://ngrok.com/) to create a secure tunnel to your server. This allows you to access the Web UI from other devices using a public URL.

## Using code_execution_tool outside of the Docker Container
### ☠️ VERY IMPORTANT NOTICE: We believe in safe and ethical AI development, and highly suggest you to use the Docker container designed for running Agent Flux.

This is a very dangerous feature, and we are not responsible for any damage or other illegal activities or legal liabilities caused by the use of this feature. You are responsible for your own actions. Use this feature only for research purposes at most, and only if you are 100% sure of what you're doing.
<details>
<summary>I accept the risks and want to use this feature.</summary>

- If you are a power-user and 100% sure of what you're doing, you can use the code_execution_tool outside of the Docker container by following these steps:

    ![Code Execution Jailbreak](res/code_exec_jailbreak.png)

1. After the installation and configuration of your Agent Flux instance, go in `initialize.py` and set the `code_exec_docker_enabled` to `False` (line 47). This will disable the code_execution_tool for your Agent Flux instance to communicate with the Docker container. The tool will search for an SSH connection at this point.

2. Comment out lines 56, 57, 58 and 59 in `initialize.py` that sets the `code_execution_tool` SSH connection parameters. Point them to your machine accordingly. This will enable the code_execution_tool for your Agent Flux instance.

3. The `code_exec_ssh_pass` parameter (root user password) has to be provided to `initialize.py` for the code_execution_tool to be able to connect to the machine.
</details>