import torch


def check_gpu_memory():
    reserved_memory = torch.cuda.memory_reserved(0)
    allocated_memory = torch.cuda.memory_allocated(0)
    free_memory = reserved_memory - allocated_memory
    print("Free memory: ", free_memory)

    if free_memory < 500 * 1024:
        return False
    return True


def clear_gpu_memory():
    torch.cuda.empty_cache()
