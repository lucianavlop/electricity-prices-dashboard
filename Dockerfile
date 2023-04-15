FROM python:3.11.3

# Set the working directory to /app
WORKDIR /app

# Install dependencies
COPY requirements.txt /app
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Copy source code
COPY . /app

# Run the app
CMD ["streamlit", "run", "Electricity.py"]
