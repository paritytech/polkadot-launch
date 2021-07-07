{ pkgs ? import <nixpkgs> { } }:
let
  polkadot-launch = pkgs.callPackage ./default.nix { };
in
with pkgs; mkShell {
  buildInputs = [
    polkadot-launch
    (yarn.override { nodejs = nodejs-14_x; })
  ];
}
