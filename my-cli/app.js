// const download = require("download-git-repo");
const download = require("download-git-repo");
const ora = require("ora");

const spinner = ora("Loading unicorns").start();

spinner.color = "yellow";
spinner.text = "Loading rainbows";
download(
  "direct:https://gitee.com/acher_Saber/new-advert.git",
  "test",
  { clone: true },
  function(err) {
    console.log(err ? "Error" : "Success");
    if (err) {
      spinner.fail("fail");
    } else {
      spinner.succeed("success");
    }
  }
);
