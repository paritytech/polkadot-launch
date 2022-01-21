{ pkgs ? import <nixpkgs> { } }:
with pkgs; mkShell {
  buildInputs = [
    nodePackages.typescript
    (yarn.override { nodejs = nodejs-14_x; })
  ];
}
