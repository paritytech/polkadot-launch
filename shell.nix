{ pkgs ? import <nixpkgs> { } }:

with pkgs; mkShell {
  buildInputs = [
    nodejs
    python27
    python27Packages.pip
    python27Packages.setuptools
    stdenv
    yarn
    yarn2nix
  ];

  shellHook = ''
    # Tells pip to put packages into $PIP_PREFIX instead of the usual locations.
    # See https://pip.pypa.io/en/stable/user_guide/#environment-variables.
    export PIP_PREFIX=${toString ./.}/_build/pip_packages
    export PYTHONPATH="$PIP_PREFIX/${python27.sitePackages}:$PYTHONPATH"
    export PATH="$PIP_PREFIX/bin:$PATH"
    unset SOURCE_DATE_EPOCH
    # NOTE: the line below is commented as this is not compatible with lorri
    # pip install blockade
  '';
}
