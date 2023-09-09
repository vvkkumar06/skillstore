import { loadFiles } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import path from 'path';
import url from 'url';

const resolversArray = await loadFiles(path.resolve('src/resolvers'), {
    requireMethod: async (path) => {
        return await import(url.pathToFileURL(path));
    }
});

export default mergeResolvers(resolversArray);