import torch


batch_size = 4
learning_rate = 1e-3
device = "cuda" if torch.cuda.is_available() else "cpu"
epochs = 20
