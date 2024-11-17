import { Folder, Snippet, Tag } from '../types';
import { SnippetContent } from '../types';

export interface BaseAPI {
  get_tags_simple(params?: Record<string, string>): Promise<Tag[]>;

  get_folders_simple(params?: Record<string, string>): Promise<Folder[]>;

  get_snippets_simple(params?: Record<string, string>): Promise<Snippet[]>;

  patch_tag(id: string, data: Partial<Tag>): Promise<Tag>;

  patch_folder(id: string, data: Partial<Folder>): Promise<Folder>;

  patch_snippet(id: string, data: Partial<Snippet>): Promise<Snippet>;

  patch_snippet_content(
    id: string,
    index: number,
    content: SnippetContent
  ): Promise<Snippet>;

  get_tags_map(
    params?: Record<string, string>,
    reverse?: boolean
  ): Promise<Record<string, string>>;

  get_folders_map(
    params?: Record<string, string>,
    reverse?: boolean
  ): Promise<Record<string, string>>;
}
