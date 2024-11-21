import axios from 'axios';
import { Tag, Folder, Snippet, SnippetContent } from '../index.d';
import { IMedium } from '../i';
import { getDbMeta } from '../utils/app';
import { parseQuery } from '../utils/query';

export class JServAPI implements IMedium {
  public apiUrl = 'http://localhost:3033';

  private full_tags_cache: Tag[] | null = null;
  private full_folders_cache: Folder[] | null = null;
  private full_snippets_cache: Snippet[] | null = null;

  private tags_map_cache: Record<string, string> | null = null;
  private folders_map_cache: Record<string, string> | null = null;
  private folders_pathes_cache: Record<string, string> | null = null;

  async full_tags(): Promise<Tag[]> {
    const { isModified } = getDbMeta();
    if (!isModified && this.full_tags_cache) {
      return this.full_tags_cache;
    }
    const { data } = await axios.get<Tag[]>(`${this.apiUrl}/tags`);
    this.full_tags_cache = data;
    return data;
  }
  async full_folders(): Promise<Folder[]> {
    const { isModified } = getDbMeta();
    if (!isModified && this.full_folders_cache) {
      return this.full_folders_cache;
    }
    const { data } = await axios.get<Folder[]>(`${this.apiUrl}/folders`);
    this.full_folders_cache = data;
    return data;
  }
  async full_snippets(): Promise<Snippet[]> {
    const { isModified } = getDbMeta();
    if (!isModified && this.full_snippets_cache) {
      return this.full_snippets_cache;
    }
    const { data } = await axios.get<Snippet[]>(`${this.apiUrl}/snippets`);
    this.full_snippets_cache = data;
    return data;
  }
  async get_tags(params?: URLSearchParams): Promise<Tag[]> {
    const { data } = await axios.get<Tag[]>(`${this.apiUrl}/tags`, { params });
    return data;
  }
  async get_folders(params?: URLSearchParams): Promise<Folder[]> {
    const { data } = await axios.get<Folder[]>(`${this.apiUrl}/folders`, {
      params,
    });
    return data;
  }
  async get_snippets(params?: URLSearchParams): Promise<Snippet[]> {
    const { data } = await axios.get<Snippet[]>(`${this.apiUrl}/snippets`, {
      params,
    });
    return data;
  }
  async patch_tag(id: string, data: Partial<Tag>): Promise<Tag> {
    const { data: patched } = await axios.patch<Tag>(
      `${this.apiUrl}/tags/${id}`,
      data
    );
    return patched;
  }
  async patch_folder(id: string, data: Partial<Folder>): Promise<Folder> {
    const { data: patched } = await axios.patch<Folder>(
      `${this.apiUrl}/folders/${id}`,
      data
    );
    return patched;
  }
  async patch_snippet(id: string, data: Partial<Snippet>): Promise<Snippet> {
    const { data: patched } = await axios.patch<Snippet>(
      `${this.apiUrl}/snippets/${id}`,
      data
    );
    return patched;
  }
  async patch_snippet_content(
    id: string,
    index: number,
    content: SnippetContent
  ): Promise<Snippet> {
    // get snippet
    const snippet = await this.get_snippets(new URLSearchParams({ id }));
    if (snippet.length === 0) {
      throw new Error('Snippet not found');
    }
    // update content
    snippet[0].content[index] = content;
    // save snippet
    const { data: patched } = await axios.patch<Snippet>(
      `${this.apiUrl}/snippets/${id}`,
      { content }
    );
    return patched;
  }

  // function to map tag names to ids and vice versa
  async get_tags_map(
    params?: URLSearchParams,
    reverse?: boolean
  ): Promise<Record<string, string>> {
    const { isModified } = getDbMeta();
    if (!isModified && this.tags_map_cache) {
      return this.tags_map_cache;
    }
    const tags = await this.get_tags(new URLSearchParams(params));
    const map = tags.reduce((acc, tag) => {
      if (reverse) {
        acc[tag.id] = tag.name;
      } else {
        acc[tag.name] = tag.id;
      }
      return acc;
    }, {} as Record<string, string>);
    this.tags_map_cache = map;
    return map;
  }
  async get_folders_map(
    params?: URLSearchParams,
    reverse?: boolean
  ): Promise<Record<string, string>> {
    const { isModified } = getDbMeta();
    if (!isModified && this.folders_map_cache) {
      return this.folders_map_cache;
    }
    const folders: Folder[] = await this.get_folders(
      new URLSearchParams(params)
    );
    const map = folders.reduce((acc, folder) => {
      if (reverse) {
        acc[folder.id] = folder.name;
      } else {
        acc[folder.name] = folder.id;
      }
      return acc;
    }, {} as Record<string, string>);
    this.folders_map_cache = map;
    return map;
  }

  async get_folders_pathes(): Promise<Record<string, string>> {
    const { isModified } = getDbMeta();
    if (!isModified && this.folders_pathes_cache) {
      return this.folders_pathes_cache;
    }
    // first filter folders without parentId
    const folders: Folder[] = await this.full_folders();
    const map = {} as Record<string, string>;
    const pendingFolders: Folder[] = [];
    for (const folder of folders) {
      if (!folder.parentId) {
        map[folder.id] = folder.name;
      } else {
        pendingFolders.push(folder);
      }
    }

    while (pendingFolders.length > 0) {
      const folder = pendingFolders.shift();
      if (!folder) {
        continue;
      }
      if (folder.parentId && map[folder.parentId]) {
        map[folder.id] = `${map[folder.parentId]}/${folder.name}`;
      } else {
        pendingFolders.push(folder); // Push back to end if parent not found yet
      }
    }

    this.folders_pathes_cache = map;
    return map;
  }

  async match_tags(name: string): Promise<Tag[]> {
    const tags = await this.get_tags();
    try {
      const regex = new RegExp(name, 'i');
      return tags.filter(tag => regex.test(tag.name));
    } catch {
      // Fallback to simple includes if regex is invalid
      return tags.filter(tag =>
        tag.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  }
  async match_folders(name: string): Promise<Folder[]> {
    const folders = await this.get_folders();
    try {
      const regex = new RegExp(name, 'i');
      return folders.filter(folder => regex.test(folder.name));
    } catch {
      return folders.filter(folder =>
        folder.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  }

  async query(
    fn: (params?: URLSearchParams) => Promise<any>,
    query: string
  ): Promise<any> {
    const parsed = parseQuery(query);
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(parsed.params)) {
      params.append(key, val.toString());
    }

    if (parsed.tags) {
      const tagsMap = await this.get_tags_map();
      for (const tag of parsed.tags) {
        params.append('tags', tagsMap[tag]);
      }
    }
  }
}
