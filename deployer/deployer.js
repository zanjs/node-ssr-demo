"use strict";

var pathFn = require("path");
var fs = require("hexo-fs");
var chalk = require("chalk");
var swig = require("swig");
var moment = require("moment");
var Promise = require("bluebird");
var spawn = require("hexo-util/lib/spawn");
var parseConfig = require("./parse_config");

var swigHelpers = {
  now: function(format) {
    return moment().format(format);
  }
};

module.exports = function(args) {
  var defaultDeployDir = args.deploy_dir;
  var baseDir = args.base_dir;
  var publicDir = args.public_dir;
  var extendDirs = args.extend_dirs;
  var ignoreHidden = args.ignore_hidden;
  var ignorePattern = args.ignore_pattern;
  var verbose = !args.silent;
  var deployDir = pathFn.join(baseDir, defaultDeployDir);
  var message = commitMessage(args);

  function git() {
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
      args[i] = arguments[i];
    }

    return spawn("git", args, {
      cwd: deployDir,
      verbose: verbose
    });
  }

  function setup() {
    var userName = args.name || args.user || args.userName || "";
    var userEmail = args.email || args.userEmail || "";

    // Create a placeholder for the first commit
    return fs
      .writeFile(pathFn.join(deployDir, "placeholder"), "")
      .then(function() {
        return git("init");
      })
      .then(function() {
        return userName && git("config", "user.name", userName);
      })
      .then(function() {
        return userEmail && git("config", "user.email", userEmail);
      })
      .then(function() {
        return git("add", "-A");
      })
      .then(function() {
        return git("commit", "-m", "First commit");
      });
  }

  function push(repo) {
    return git("add", "-A")
      .then(function() {
        return git("commit", "-m", message).catch(function() {
          // Do nothing. It's OK if nothing to commit.
        });
      })
      .then(function() {
        return git("push", "-u", repo.url, "HEAD:" + repo.branch, "--force");
      });
  }

  return fs
    .exists(deployDir)
    .then(function(exist) {
      if (exist) return;

      console.log("Setting up Git deployment...");
      return setup();
    })
    .then(function() {
      console.log(`Clearing ${defaultDeployDir} folder...`);
      // console.log("Clearing .deploy_git folder...");
      return fs.emptyDir(deployDir);
    })
    .then(function() {
      var opts = {};
      console.log("Copying files from public folder...");
      if (typeof ignoreHidden === "object") {
        opts.ignoreHidden = ignoreHidden.public;
      } else {
        opts.ignoreHidden = ignoreHidden;
      }

      if (typeof ignorePattern === "string") {
        opts.ignorePattern = new RegExp(ignorePattern);
      } else if (
        typeof ignorePattern === "object" &&
        ignorePattern.hasOwnProperty("public")
      ) {
        opts.ignorePattern = new RegExp(ignorePattern.public);
      }

      return fs.copyDir(publicDir, deployDir, opts);
    })
    .then(function() {
      console.log("Copying files from extend dirs...");

      if (!extendDirs) {
        return;
      }

      if (typeof extendDirs === "string") {
        extendDirs = [extendDirs];
      }

      var mapFn = function(dir) {
        var opts = {};
        var extendPath = pathFn.join(baseDir, dir);
        var extendDist = pathFn.join(deployDir, dir);

        if (typeof ignoreHidden === "object") {
          opts.ignoreHidden = ignoreHidden[dir];
        } else {
          opts.ignoreHidden = ignoreHidden;
        }

        if (typeof ignorePattern === "string") {
          opts.ignorePattern = new RegExp(ignorePattern);
        } else if (
          typeof ignorePattern === "object" &&
          ignorePattern.hasOwnProperty(dir)
        ) {
          opts.ignorePattern = new RegExp(ignorePattern[dir]);
        }

        return fs.copyDir(extendPath, extendDist, opts);
      };

      return Promise.map(extendDirs, mapFn, {
        concurrency: 2
      });
    })
    .then(function() {
      return parseConfig(args);
    })
    .each(function(repo) {
      return push(repo);
    });
};

function commitMessage(args) {
  var message =
    args.m ||
    args.msg ||
    args.message ||
    "Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}";
  return swig.compile(message)(swigHelpers);
}