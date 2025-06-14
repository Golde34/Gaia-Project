#!/bin/bash

# Set variables
PORT=7997
EMBEDDING_MODEL=BAAI/bge-large-en-v1.5
RERANKER_MODEL=BAAI/bge-reranker-v2-m3
CACHE_DIR=$PWD/infinity_cache

# Create cache directory if it doesn't exist
mkdir -p $CACHE_DIR

# Run docker container with both models (CPU version)
# For gpu:
# docker run -it --gpus all -v $CACHE_DIR:/app/.cache \
#     -p $PORT:$PORT \
#     michaelf34/infinity:latest \
#     v2 \
#     --model-id $EMBEDDING_MODEL \
#     --model-id $RERf34

# For cpu:
docker run -it -v $CACHE_DIR:/app/.cache \
    -p $PORT:$PORT \
    michaelf34/infinity:latest \
    v2 \
    --model-id $EMBEDDING_MODEL \
    --model-id $RERANKER_MODEL \
    --port $PORT