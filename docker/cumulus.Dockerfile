FROM debian:buster-slim

# install tools and dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        clang cmake curl git pkg-config && \
# apt cleanup
    apt-get autoremove -y && \
    apt-get clean && \
    find /var/lib/apt/lists/ -type f -not -name lock -delete; \
# add user and link ~/.local/share/cumulus to /data
    useradd -m -u 1000 -U -s /bin/sh -d /cumulus cumulus && \
    mkdir -p /data /cumulus/.local/share && \
    chown -R cumulus:cumulus /data && \
    ln -s /data /cumulus/.local/share/cumulus

# install rust toolchain
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    export PATH="$PATH:$HOME/.cargo/bin" && \
    rustup toolchain install nightly && \
    rustup target add wasm32-unknown-unknown --toolchain nightly && \
    rustup default stable

# clone cumulus. the trick of using the github API will make the docker cache
# invalidate when there's a new commit.
ADD https://api.github.com/repos/paritytech/cumulus/git/refs/heads/rococo-v1 version.json
RUN git clone -b rococo-v1 https://github.com/paritytech/cumulus.git /tmp/cumulus

# build cumulus
RUN cd /tmp/cumulus && \
    export PATH="$PATH:$HOME/.cargo/bin" && \
    cargo build --release -p rococo-collator && \
    cp /tmp/cumulus/target/release/rococo-collator /usr/local/bin

# show backtraces
ENV RUST_BACKTRACE 1

USER cumulus

# check if executable works in this container
RUN /usr/local/bin/rococo-collator --version

EXPOSE 30333 9933 9944
VOLUME ["/cumulus"]

ENTRYPOINT ["/usr/local/bin/rococo-collator"]
