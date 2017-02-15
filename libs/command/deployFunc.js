'use strict';
const log = require('./log');
const path = require('path');
const fs = require('fs-extra');
const spawn = require('cross-spawn');
// stream
var Transform = require('stream').Transform;

function CacheStream() {
    Transform.call(this);
    this._cache = [];
}
require('util').inherits(CacheStream, Transform);
CacheStream.prototype._transform = function(chunk, enc, callback) {
    var buf = chunk instanceof Buffer ? chunk : new Buffer(chunk, enc);
    this._cache.push(buf);
    this.push(buf);
    callback();
};
CacheStream.prototype.destroy = function() {
    this._cache.length = 0;
};
CacheStream.prototype.getCache = function() {
    return Buffer.concat(this._cache);
};
// git
let deployFunc = {
    init: function(options) {
        let args = options.deploy[0];
        let baseDir = path.resolve(process.cwd());
        let deployDir = path.join(baseDir, '.deploy_git');
        let publicDir = path.resolve(process.cwd(), options.output_dir);
        let message = args.msg || args.message || 'update';
        let repoInfo = {
            url: args.repo || args.repository,
            branch: args.branch || data.branch || 'master'
        };
        if (!args.repo && !args.repository) {
            log.error('please check _config.yml.');
            return;
        }

        function git() {
            let len = arguments.length;
            let gitArgs = new Array(len);
            for (let i = 0; i < len; i++) {
                gitArgs[i] = arguments[i];
            }
            let task = spawn('git', gitArgs, {
                cwd: deployDir
            });
            var encoding = 'utf8';
            var stderrCache = new CacheStream();
            var stdoutCache = new CacheStream();
            if (task.stdout) {
                var stdout = task.stdout.pipe(stdoutCache);
                stdout.pipe(process.stdout);
            }
            if (task.stderr) {
                var stderr = task.stderr.pipe(stderrCache);
                stderr.pipe(process.stderr);
            }
            task.on('close', function(code) {
                if (code) {
                    var e = new Error(getCache(stderrCache, encoding));
                    e.code = code;
                    return;
                }
                getCache(stdoutCache, encoding);
            });

            function getCache(stream, encoding) {
                var buf = stream.getCache();
                stream.destroy();
                console.log(buf.toString(encoding));
            }
        }

        function setup() {
            let userName = args.name || '';
            let userEmail = args.email || '';
            fs.mkdirSync(deployDir);
            fs.writeFileSync(path.join(deployDir, 'placeholder'), '', 'utf8');
            git('init');
            userName && git('config', 'user.name', userName);
            userEmail && git('config', 'user.email', userEmail);
            git('add', '-A');
            git('commit', '-m', 'First commit');
        }

        function push(repo) {
            git('add', '-A');
            git('commit', '-m', message);
            git('push', '-u', repo.url, 'HEAD:' + repo.branch, '--force');
        }
        if (!fs.existsSync(deployDir)) {
            setup();
        }
        fs.emptydirSync(deployDir);

        let indexLock;
        let lockPath = path.resolve(deployDir, './.git/index.lock');
        try {
            fs.accessSync(lockPath);
            indexLock = true;
        } catch (e) {
            indexLock = false;
        }
        if(indexLock){
          fs.removeSync(lockPath);  
        }
        fs.copySync(publicDir, deployDir);
        setTimeout(function() {
            push(repoInfo);
        }, 3000);
    }
};
module.exports = deployFunc;