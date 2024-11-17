import axios from 'axios';
import type { Tag, Folder, Snippet, SnippetContent } from '../types';
import { BaseAPI } from './i';
import { getDbMeta } from '../utils/pref';

const DEFAULT_API_URL = 'http://localhost:3033';

export class JservAPI implements BaseAPI {
  private tagsMapCache: Record<string, string> | null = null;
  private foldersMapCache: Record<string, string> | null = null;

  constructor(private readonly apiUrl: string = DEFAULT_API_URL) {}

  async get_tags_map(
    params?: Record<string, string>,
    reverse?: boolean
  ): Promise<Record<string, string>> {
    if (this.tagsMapCache) {
      const { isModified } = getDbMeta();
      // Check if cache is still valid
      if (!isModified) {
        return Promise.resolve(this.tagsMapCache);
      }
    }
    const tags = await this.get_tags_simple(params);
    const tagsMap = tags.reduce((acc, tag) => {
      if (reverse) {
        acc[tag.name] = tag.id;
      } else {
        acc[tag.id] = tag.name;
      }
      return acc;
    }, {} as Record<string, string>);
    this.tagsMapCache = tagsMap;
    return tagsMap;
  }

  async get_folders_map(
    params?: Record<string, string>,
    reverse?: boolean
  ): Promise<Record<string, string>> {
    if (this.foldersMapCache) {
      const { isModified } = getDbMeta();
      if (!isModified) {
        return Promise.resolve(this.foldersMapCache);
      }
    }
    const folders = await this.get_folders_simple(params);
    const foldersMap = folders.reduce((acc, folder) => {
      if (reverse) {
        acc[folder.name] = folder.id;
      } else {
        acc[folder.id] = folder.name;
      }
      return acc;
    }, {} as Record<string, string>);
    this.foldersMapCache = foldersMap;
    return foldersMap;
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
    //get the snippet
    const snippet = await this.get_snippets_simple({ id });
    if (snippet.length === 0) {
      throw new Error('Snippet not found');
    }
    //update the content
    snippet[0].content[index] = content;
    //save the snippet
    const { data: patched } = await axios.patch<Snippet>(
      `${this.apiUrl}/snippets/${id}`,
      { content }
    );
    return patched;
  }

  async get_tags_simple(params?: Record<string, string>): Promise<Tag[]> {
    const { data } = await axios.get<Tag[]>(`${this.apiUrl}/tags`, {
      params,
    });
    return data;
  }

  async get_folders_simple(params?: Record<string, string>): Promise<Folder[]> {
    const { data } = await axios.get<Folder[]>(`${this.apiUrl}/folders`, {
      params,
    });
    return data;
  }
  async get_snippets_simple(
    params?: Record<string, string>
  ): Promise<Snippet[]> {
    const { data } = await axios.get<Snippet[]>(`${this.apiUrl}/snippets`, {
      params,
    });
    return data;
  }
}
