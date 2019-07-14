const deploy = require("./deployer/deployer");
const base_dir = process.cwd();
const public_dir = `${base_dir}/dist`;
 
const params = {
  base_dir,
  type: "git",
  branch: "master",
  _: []
};
 
const docParams = {
  ...params,
  public_dir,
  deploy_dir: ".deploy",
  repository: { coding: "https://git.6s.mu.gg/zanjs/tmp.git" }
};

deploy(docParams)