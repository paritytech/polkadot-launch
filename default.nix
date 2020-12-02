{ pkgs ? import <nixpkgs> { } }:
pkgs.mkYarnPackage {
  name = "polkadot-launch";
  src = builtins.filterSource
    (path: type: type != "directory" || baseNameOf path != "bin")
    ./.;
  buildPhase = ''
    yarn build
  '';
  postInstall = ''
    chmod +x $out/bin/polkadot-launch
  '';
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;
}
