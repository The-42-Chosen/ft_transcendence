FROM python:3.12.15-slim

RUN pip install numpy

WORKDIR /home/src

COPY --chmod=100 src .

EXPOSE 8001

RUN python3 telecharger_vecteurs.py

ENTRYPOINT ["python3", "-u", "server_ia.py"]
