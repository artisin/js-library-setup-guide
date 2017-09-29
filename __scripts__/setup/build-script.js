const path = require('path');
const fs   = require('fs-extra');

/**
 * Builds the assets based on answers
 * @param  {str} DIR     -> build dir
 * @param  {obj} answers -> build arguments
 * @return {---}         -> builds assets
 */
const buildScript = function(DIR, answers) {
  if (answers.warning) {
    //first remove current root files
    const fileList = function(rootDir) {
      return fs.existsSync(rootDir) ? fs.readdirSync(rootDir).reduce(function(list, file) {
        const name = path.join(rootDir, file);
        const isDir = fs.statSync(name).isDirectory();
        return isDir ? list : list.concat(file);
      }, []) : [];
    };
    fileList(DIR).forEach(function (val) {
      fs.removeSync(val);
    });

    //ensure build path
    fs.ensureDirSync(DIR);
    //removes spaces from project name and lowercase for url
    const cleanStr = (val) => val.replace(/\s/g, '-').toLowerCase();
    const projectURL = cleanStr(answers.gitPROJECTNAME);
    const libraryURL = cleanStr(answers.libraryName);
    //babelrc
    require('./generate-files/babelrc.generate.js')({
      dir: DIR,
      babelNodeTarget: answers.babelNodeTarget,
      babelWebTarget: answers.babelWebTarget,
      target: answers.target
    });
    //contributing
    require('./generate-files/contributing.generate.js')({
      dir: DIR,
      gitUSERNAME: answers.gitUSERNAME,
      gitPROJECTNAME: projectURL,
      NPMorYARN: answers.NPMorYARN[0],
      commitizen: answers.commitizen
    });
    //inject files
    const files = [];
    if (answers.bumpedrc) { files.push('.bumpedrc'); }
    if (answers.changelog) { files.push('CHANGELOG.md'); }
    if (answers.commitizen) { files.push('.cz-config.js'); }
    if (answers.eslintrc) { files.push('.eslintrc.js'); }
    if (answers.gitattributes) { files.push('.gitattributes'); }
    if (answers.gitignore) { files.push('.gitignore'); }
    if (answers.npmignore) { files.push('.npmignore'); }
    if (answers.tests) { files.push('__tests__'); }
    if (answers.wercker) { files.push('wercker.yml'); }
    require('./generate-files/inject.generate.js')({
      dir: DIR,
      files: files
    });
    //.nvmrc
    require('./generate-files/nvmrc.generate.js')({
      dir: DIR,
      nvmrc: answers.nvmrc
    });
    //.github
    require('./generate-files/github.generate.js')({
      dir: DIR,
      gitPROJECTNAME: projectURL
    });
    //license
    require('./generate-files/license.generate.js')({
      dir: DIR,
      gitUSERNAME: answers.gitUSERNAME,
      gitPROJECTNAME: projectURL,
      authorName: answers.authorName
    });
    //always config package.json
    require('./generate-files/package.json.generate.js')({
      dir: DIR,
      NPMorYARN: answers.NPMorYARN[0],
      libraryName: libraryURL,
      libraryDescription: answers.libraryDescription,
      authorName: answers.authorName,
      gitUSERNAME: answers.gitUSERNAME,
      gitPROJECTNAME: projectURL,
      tests: answers.tests,
      bumpedrc: answers.bumpedrc,
      commitizen: answers.commitizen
    });
    //readme
    if (answers.readme) {
      require('./generate-files/readme.generate.js')({
        dir: DIR,
        gitPROJECTNAME: answers.gitPROJECTNAME
      });
    }
    //gen webpack config
    require('./generate-files/webpack.generate.js')({
      dir: DIR,
      libraryName: libraryURL,
      target: answers.target
    });
    //zappr
    if (answers.zappr) {
      require('./generate-files/zappr.generate.js')({
        dir: DIR,
        gitUSERNAME: answers.gitUSERNAME
      });
    }

    //create lib/index.js
    fs.ensureFileSync(path.resolve(DIR, 'lib/index.js'));
    //delete old node_modules
    fs.removeSync(path.resolve(DIR, 'node_modules'));
    //delete yarn.lock
    fs.removeSync(path.resolve(DIR, 'yarn.lock'));
    if (answers.git) {
      //deletes old .git dir
      fs.removeSync(path.resolve(DIR, '.git'));
    }
    if (answers.removeSelf) {
      //remove self
      fs.removeSync(path.resolve(DIR, '__scripts__/setup'));
    }
  }
};

module.exports = buildScript;
