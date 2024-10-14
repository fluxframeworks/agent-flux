# Troubleshooting and FAQ
This page addresses frequently asked questions (FAQ) and provides troubleshooting steps for common issues encountered while using Agent Flux.

## Frequently Asked Questions
**1. How do I set up and activate a Python virtual environment?**

Use the `venv` module or `conda` (recommended).

* **`venv`:**
    ```bash
    python -m venv .venv  # Create the environment
    source .venv/bin/activate  # Activate (Linux/macOS)
    .venv\Scripts\activate  # Activate (Windows)
    ```
* **`conda`:**
    ```bash
    conda create -n agent-flux python=3.12  # Create
    conda activate agent-flux  # Activate
    ```

**2. How do I resolve `ModuleNotFoundError` errors (e.g., for `ansio`, `pyflakes`, `Flask`)?**

Ensure your virtual environment is activated *before* installing requirements:

```bash
pip install -r requirements.txt
```

**3. How do I integrate models like `ollama` or `llama` with Agent Flux?**
Refer to the [Choosing your LLMs](architecture.md#installing-and-using-ollama) section of the documentation for detailed instructions and examples for configuring different LLMs in `initialize.py`. (This assumes you'll have a dedicated documentation page for model integration).

**4. How can I make Agent Flux retain memory between sessions?**
Auto memory automatically saves and loads solutions and informations from previous sessions.

**5. Where can I find more documentation or tutorials?**
*   Join the [Agent Flux Discord community](https://discord.gg/Z2tun2N3) for support and discussions.

**6. Can I run Agent Flux without API keys or for free?**
You can experiment with locally hosted open-source LLMs like Llama.  Refer to [Choosing Your LLMs](architecture#choosing-your-llms) section for configuration instructions.  Using API-based LLMs like those from OpenAI, Google, etc., requires API keys and might incur costs.

**7. How do I adjust API rate limits?**
Modify the `rate_limit_seconds` and `rate_limit_requests` parameters in the `AgentConfig` class within `initialize.py`.

**8. Can Agent Flux interact with external APIs or services (e.g., WhatsApp)?**
Extending Agent Flux to interact with external APIs is possible by creating custom tools or solutions. Refer to the documentation on creating them. 

## Troubleshooting

**Installation**
* **Dependency Conflicts:** If encountering version conflicts during installation, try creating a fresh virtual environment and reinstalling the requirements.
* **Docker Issues:** If Docker containers fail to start or Agent Flux can't connect to Docker, consult the Docker documentation and verify your Docker installation and configuration.  On macOS, ensure you've granted Docker access to your project files in Docker Desktop's settings as described in the Installation guide.

**Usage**
* **"Nothing happens" when sending a message:** This often indicates a tool execution issue, an API connection problem, or rate limiting. Check your API keys, internet connection, and ensure any required services (like Docker) are running.  Examine the logs for more details.

* **Terminal commands not executing:** If using Docker for code execution, ensure the Docker container is running and properly configured.  Check SSH settings if applicable.

* **Error Messages:** Pay close attention to the error messages displayed in the Web UI or terminal.  They often provide valuable clues for diagnosing the issue. Refer to the specific error message in online searches or community forums for potential solutions.

* **Performance Issues:** If Agent Flux is slow or unresponsive, it might be due to resource limitations, network latency, or the complexity of your prompts and tasks.