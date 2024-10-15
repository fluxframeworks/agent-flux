![Agent Flux Logo](res/header.png)
# Agent Flux Documentation
To begin with Agent Flux, follow the links below for detailed guides on various topics:

- **[Installation](installation.md):** Set up (or [update](installation.md#how-to-update-agent-flux)) Agent Flux on your system.
- **[Quick Start](quickstart.md):** Begin using Agent Flux with practical examples.
- **[Usage Guide](usage.md):** Explore advanced features and capabilities.
- **[Architecture Overview](architecture.md):** Understand the internal workings of the framework.
- **[Contributing](contribution.md):** Learn how to contribute to the Agent Flux project.
- **[Troubleshooting and FAQ](troubleshooting.md):** Find answers to common issues and questions.
##
### Your experience with Agent Flux starts now!

- **Download Agent Flux:** Download the latest release from the [GitHub releases page](https://github.com/fluxframeworks/agent-flux/releases).
- **Join the Community:** Join the Agent Flux [Skool](https://www.skool.com/agent-flux) or [Discord](https://discord.gg/Z2tun2N3) community to discuss ideas, ask questions, and collaborate with other contributors.
- **Share your Work:** Share your Agent Flux creations, workflows and discoverings on our [Show and Tell](https://github.com/fluxframeworks/agent-flux/discussions/categories/show-and-tell) area on GitHub.
- **Report Issues:** Use the [GitHub issue tracker](https://github.com/fluxframeworks/agent-flux/issues) to report framework-relative bugs or suggest new features.
##
## Table of Contents

- [Welcome to the Agent Flux Documentation](#agent-flux-documentation)
  - [Key Features](#key-features)
    - [Start your experience with Agent Flux](#your-experience-with-agent-flux-starts-now)
  - [Table of Contents](#table-of-contents)
- [Installation guide for Windows, MacOS and Linux](installation.md)
  - [Windows Quick Start](installation.md#windows-quick-start)
  - [macOS Quick Start](installation.md#macos-quick-start)
  - [Linux Quick Start](installation.md#linux-quick-start)
  - [In-Depth Guide for Windows and MacOS](installation.md#in-depth-guide-for-windows-and-macos)
    - [1. Install Conda (miniconda)](installation.md#1-install-conda-miniconda)
    - [2. Install Docker (Docker Desktop application)](installation.md#2-install-docker-docker-desktop-application)
    - [3. Download Agent Flux](installation.md#3-download-agent-flux)
    - [4. Set up Conda environment](installation.md#4-set-up-conda-environment)
    - [5. Configure Agent Flux](installation.md#5-configure-agent-flux)
    - [6. Run Agent Flux](installation.md#6-run-agent-flux)
    - [Choosing Your LLMs](installation.md#choosing-your-llms)
      - [Installing and Using Ollama](installation.md#installing-and-using-ollama-local-models)
    - [How to update Agent Flux](installation.md#how-to-update-agent-flux)
    - [How to create executable files for Agent Flux](installation.md#how-to-create-executable-files-for-agent-flux-in-windows-macos-and-linux)
    - [Conclusion](installation.md#conclusion)
- [Quick Start](quickstart.md)
  - [Launching the Web UI](quickstart.md#launching-the-web-ui)
  - [Running a Simple Task](quickstart.md#running-a-simple-task)
  - [Example Interaction](quickstart.md#example-interaction)
  - [Next Steps](quickstart.md#next-steps)
- [Usage Guide](usage.md)
  - [Tool Usage](usage.md#tool-usage)
  - [Prompt Engineering](usage.md#prompt-engineering)
  - [Example of Tools Usage](usage.md#example-of-tools-usage-web-search-and-code-execution)
  - [Memory Management](usage.md#memory-management)
  - [Multi-Agent Cooperation](usage.md#multi-agent-cooperation)
  - [Agent Behavior](usage.md#agent-behavior)
  - [Using Agent Flux on your mobile device](usage.md#using-agent-flux-on-your-mobile-device)
  - [Using code_execution_tool outside of the Docker Container](usage.md#using-code_execution_tool-outside-of-the-docker-container)
- [Architecture Overview](architecture.md)
  - [Core Components](architecture.md#core-components)
  - [Agent Hierarchy and Communication](architecture.md#agent-hierarchy-and-communication)
  - [Interaction Flow](architecture.md#interaction-flow)
  - [Memory System](architecture.md#memory-system)
  - [Tools](architecture.md#tools)
  - [Knowledge](architecture.md#knowledge)
  - [Prompts](architecture.md#prompts)
  - [Extensions](architecture.md#extensions)
    - [Structure of Extensions](architecture.md#structure-of-extensions)
    - [Types of Default Extensions](architecture.md#types-of-default-extensions)
  - [Key Files](architecture.md#key-files)
  - [Directory Structure](architecture.md#directory-structure)
  - [Customization](architecture.md#customization)
    - [Custom Prompts](architecture.md#custom-prompts)
      - [Changing the System Prompt Folder](architecture.md#changing-the-system-prompt-folder)
    - [AgentConfig](architecture.md#agentconfig)
    - [Adding Tools](architecture.md#adding-tools)
    - [Adding Instruments](architecture.md#adding-instruments)
    - [Adding Extensions](architecture.md#adding-extensions)
- [Contributing to Agent Flux](contribution.md)
  - [Getting Started](contribution.md#getting-started)
  - [Making Changes](contribution.md#making-changes)
  - [Submitting a Pull Request](contribution.md#submitting-a-pull-request)
  - [Documentation Stack](contribution.md#documentation-stack)
- [FAQ and Troubleshooting](troubleshooting.md)
  - [Frequently Asked Questions](troubleshooting.md#frequently-asked-questions)
  - [Troubleshooting](troubleshooting.md#troubleshooting)