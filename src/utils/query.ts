export interface QueryResult {
  folder: string[];
  foldersExclude: string[];
  tags: string[];
  tagsExclude: string[];
  params: { [key: string]: string }[];
  search: string;
}

export function parseQuery(query: string): QueryResult {
  const result: QueryResult = {
    params: [],
    folder: [],
    foldersExclude: [],
    tags: [],
    tagsExclude: [],
    search: '',
  };

  // Split the query into parts
  const parts = query.trim().split(' ');

  // Process each part
  parts.forEach(part => {
    if (part.startsWith('@')) {
      // Handle folder path
      result.folder.push(part.slice(1));
    } else if (part.startsWith('#')) {
      // Handle tags
      result.tags.push(part.slice(1));
    } else if (part.startsWith('>')) {
      // Handle params
      const param = part.slice(1).split('=');
      result.params.push({ [param[0]]: param[1] });
    } else if (part.startsWith('~@')) {
      result.foldersExclude.push(part.slice(2));
    } else if (part.startsWith('~#')) {
      result.tagsExclude.push(part.slice(2));
    } else {
      // Handle search key
      result.search += part + ' ';
    }
  });

  return result;
}
