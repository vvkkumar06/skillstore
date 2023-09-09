import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

const typeArray = loadFilesSync(path.resolve('src/schemas'));

export default mergeTypeDefs(typeArray);