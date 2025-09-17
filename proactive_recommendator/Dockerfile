# Use the official Python 3.9 image as the base
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application files
COPY . .

# Ensure the run.sh script is executable
RUN chmod +x ./run.sh

# Expose port 8000 to allow external access
EXPOSE 4005 

# Set the default command to execute the script
CMD ["./run.sh"]
