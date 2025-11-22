FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Create vscode user (expected by devcontainer.json)
RUN groupadd -r vscode && \
    useradd -r -g vscode -m -s /bin/bash vscode && \
    usermod -aG sudo vscode

# Install Foundry for vscode user
RUN su vscode -c "curl -L https://foundry.paradigm.xyz | bash" && \
    su vscode -c "/home/vscode/.foundry/bin/foundryup"

# Add Foundry to PATH
ENV PATH="/home/vscode/.foundry/bin:${PATH}"

USER vscode
