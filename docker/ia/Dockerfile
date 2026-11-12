FROM python:3.12.15-slim

RUN pip install numpy

WORKDIR /home/src

# github release of the project
ARG VECTEURS_URL=https://github.com/The-42-Chosen/ft_transcendence/releases/download/vector-1

ADD --chmod=444 --checksum=sha256:5c15f3b2396623a6eee5a9deaf043528e5841e52d6bed5f57d61a6c9315afa97 \
    ${VECTEURS_URL}/cc.fr.300.top100000.npz vecteurs/
ADD --chmod=444 --checksum=sha256:6b9677c2ae45213942644bf15b5aee1c991165636d640b9f4eb57744558d5937 \
    ${VECTEURS_URL}/cc.en.300.top100000.npz vecteurs/
ADD --chmod=444 --checksum=sha256:a3009e29a40212f7ee55e9ff9916f2de7934fef78f0c9874ccd7bce478404290 \
    ${VECTEURS_URL}/cc.es.300.top100000.npz vecteurs/

ADD --chmod=444 --checksum=sha256:b78a868e31dd6e373b6c3217969afb898a9acde828a5e7ef97308da42218c88c \
    ${VECTEURS_URL}/fr.dic dictionnaires/
ADD --chmod=444 --checksum=sha256:f0b1a234bd178bdd01875b2a392a9647f888b8fe879f79c52aae62c2759b3647 \
    ${VECTEURS_URL}/en.dic dictionnaires/
ADD --chmod=444 --checksum=sha256:6975dddec3d5d2c676069537bc67b4b5f786c65c5d4cf6703a82acf779ac9ec1 \
    ${VECTEURS_URL}/es.dic dictionnaires/

COPY --chmod=100 src .

EXPOSE 8001

ENTRYPOINT ["python3", "-u", "server_ia.py"]
