{ pkgs ? import <nixpkgs> { } }:
with pkgs; mkShell {
  buildInputs = [
    (yarn.override { nodejs = nodejs-14_x; })
  ];
}
