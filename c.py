import torch
print("CUDA Available:", torch.cuda.is_available())  # Should print True
print("CUDA Version:", torch.version.cuda)  # Should print 12.6
print("Torch Version:", torch.__version__)  # Should print 2.6.0+cu126
print("GPU Name:", torch.cuda.get_device_name(0))  # Should print your GPU model
