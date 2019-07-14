var pathFn = require('path');

 var baseDir = pathFn.join(__dirname, './');
 var publicDir = pathFn.join(baseDir, 'log');
 var fakeRemote = pathFn.join(baseDir, 'remote');
 var validateDir = pathFn.join(baseDir, 'validate');
 var extendDir = pathFn.join(baseDir, 'extend');

 var ctx = {
   base_dir: baseDir,
   public_dir: publicDir,
   log: {
     info: function() {}
   }
 };

 var deployer = require('./deployer-git/deployer').bind(ctx);

 deployer()