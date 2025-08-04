#!/bin/bash

# LyraRamp Contract Deployment Script

set -e

echo "🚀 Deploying LyraRamp contract..."

# Check private key
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Set your private key: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Compile contracts
echo "🔨 Compiling contracts..."
yarn compile

# Run tests
echo "🧪 Running tests..."
yarn test --match-contract LyraRampTest

# Deploy to Scroll Sepolia
echo "🌐 Deploying to Scroll Sepolia..."
echo "⚠️  Make sure you have Scroll Sepolia ETH!"
echo ""

read -p "Press Enter to continue with deployment..."

# Deploy the contract
cd packages/foundry
/Users/charleshor/.foundry/bin/forge script DeployLyraRamp.s.sol:DeployLyraRamp \
    --rpc-url https://sepolia-rpc.scroll.io \
    --private-key $PRIVATE_KEY \
    --broadcast
cd ../..

echo "✅ LyraRamp contract deployed successfully!"
echo "📝 Please note the contract address from the output above"
echo ""

# Setup subgraph
echo "📊 Setting up subgraph..."
echo "📝 After deployment, update the contract address in packages/subgraph-lyra/subgraph.yaml"
echo "📝 Then run: cd packages/subgraph-lyra && yarn codegen && yarn build && yarn deploy" 