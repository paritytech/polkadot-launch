with (import <nixpkgs> {});

mkYarnPackage {
  name = "polkadot-launch";
  src = ./.;
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;
}
