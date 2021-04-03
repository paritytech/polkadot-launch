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
# add user and link ~/.local/share/adder-collator to /data
    useradd -m -u 1000 -U -s /bin/sh -d /adder-collator adder-collator && \
    mkdir -p /data /adder-collator/.local/share && \
    chown -R adder-collator:adder-collator /data && \
    ln -s /data /adder-collator/.local/share/adder-collator

# install rust toolchain
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    export PATH="$PATH:$HOME/.cargo/bin" && \
    rustup toolchain install nightly && \
    rustup target add wasm32-unknown-unknown --toolchain nightly && \
    rustup default stable

# clone polkadot. the trick of using the github API will make the docker cache
# invalidate when there's a new commit.
ADD https://api.github.com/repos/paritytech/polkadot/git/refs/heads/rococo-v1 version.json
RUN git clone -b rococo-v1 https://github.com/paritytech/polkadot.git /tmp/polkadot

# build polkadot
RUN cd /tmp/polkadot && \
    export PATH="$PATH:$HOME/.cargo/bin" && \
    cargo build --release -p test-parachain-adder-collator && \
    cp /tmp/polkadot/target/release/adder-collator /usr/local/bin

# show backtraces
ENV RUST_BACKTRACE 1

USER adder-collator

# check if executable works in this container
RUN /usr/local/bin/adder-collator --version

EXPOSE 30333 9933 9944
VOLUME ["/adder-collator"]

ENTRYPOINT ["/usr/local/bin/adder-collator"]
