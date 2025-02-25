
from diffusers import DiffusionPipeline
import torch
import sys
import os
import time
os.environ["XFORMERS_FORCE_DISABLE"] = "1"

# Ensure the user_data directory exists
output_dir = "user_data"
os.makedirs(output_dir, exist_ok=True)

# Load Stable Diffusion XL Base1.0
pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True
).to("cuda")

# Load Trained LoRA Weights
pipe.load_lora_weights("RNAryan/model_card")

# Get the prompt from the command line argument
prompt = sys.argv[1]

# Generate final image
image = pipe(
    prompt=prompt + " theme bedroom",
    num_inference_steps=50,
    height=640,
    width=640,
    guidance_scale=7.0
).images[0]

# Save the generated image
timestamp = int(time.time())
image_path = os.path.join(output_dir, f"generated_image_{timestamp}.png")
image.save(image_path)

image_path = os.path.join("public", f"generated_image.png")
image.save(image_path)

print(f"IMAGE_READY {image_path}")  # Notify Node.js that image is ready
sys.stdout.flush()
