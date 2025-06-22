FROM python:3.10

WORKDIR /code

# Copy pyproject.toml first to enable Docker cache for deps
COPY ./pyproject.toml /code/pyproject.toml

# Copy entire project source (including app/, migrations/, etc.)
COPY . /code/

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install .

# Entrypoint
COPY ./entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/entrypoint.sh

EXPOSE 80

CMD ["/code/entrypoint.sh"]
