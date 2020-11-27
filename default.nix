with (import <nixpkgs> {});
rec {
  polkadot-launch = mkYarnPackage {
    name = "polkadot-launch";
    src = ./.;
    buildPhase = ''
      yarn build
    '';
    postInstall = ''
      chmod +x $out/bin/polkadot-launch
    '';
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
  };
}
