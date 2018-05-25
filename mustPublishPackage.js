var helpers = require('./js/helpers/npmhelper');

const npmHelper = new helpers.NpmHelper();
var packageJson = process.argv[process.argv.length - 1];
var packageInfo = npmHelper.getPackageInfo(packageJson);

var mustPublish = npmHelper.isNewPackage(packageJson);
console.log('Must publish: ' + mustPublish);

console.log('##vso[task.setvariable variable=mustPublish;isSecret=false;isOutput=true;]' + mustPublish);
