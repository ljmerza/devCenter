version_file=src/app/app.version.ts;
value=`cat package.json`;
echo "$value";
echo "// This file was generated on $(date)
export const appVersion = $value;" > $version_file;
git add $version_file;

npm run beta;